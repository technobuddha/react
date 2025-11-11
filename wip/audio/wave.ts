import { BinaryReader } from './binary-reader.ts';
import { BinaryWriter } from './binary-writer.ts';

export class Wave {
  public constructor(waveFile: ArrayBuffer);
  public constructor(
    sampleRate: number,
    bitsPerSample: number,
    channelData: Float32Array[],
    tags?: Record<string, string>,
  );
  public constructor(
    waveFile: ArrayBuffer | number,
    bitsPerSample?: number,
    channelData?: Float32Array[],
    tags?: Record<string, string>,
  ) {
    if (waveFile instanceof ArrayBuffer) {
      const reader = new BinaryReader(waveFile);

      /* Decoding PCM */

      /* waveChunkID       */ reader.readString(4);
      /* waveChunkSize     */ reader.readUInt32();
      /* waveFormat        */ reader.readString(4);

      reader.gotoString('fmt ');
      /* waveSubchunk1ID   */ reader.readString(4);
      /* waveSubchunk1Size */ reader.readUInt32();
      /* waveAudioFormat   */ reader.readUInt16();
      const waveNumChannels = reader.readUInt16();
      const waveSampleRate = reader.readUInt32();
      /* waveByteRate      */ reader.readUInt32();
      const waveBlockAlign = reader.readUInt16();
      const waveBitsPerSample = reader.readUInt16();

      // get the data block, sometimes there blocks like cue before
      reader.gotoString('data');
      /* waveSubchunk2ID   */ reader.readString(4);
      const waveSubchunk2Size = reader.readUInt32();

      const samplesPerChannel = waveSubchunk2Size / waveBlockAlign;

      this.channels = waveNumChannels;
      this.sampleRate = waveSampleRate;
      this.bitsPerSample = waveBitsPerSample;
      this.samplesPerChannel = samplesPerChannel;

      this.channelData = [];
      for (let i = 0; i < waveNumChannels; ++i) {
        this.channelData[i] = new Float32Array(samplesPerChannel);
      }

      // fill channels
      const signedBorder = Wave.signedBorders[waveBitsPerSample / 8];
      for (let i = 0; i < samplesPerChannel; ++i) {
        for (let channel = 0; channel < waveNumChannels; ++channel) {
          const value = Wave.convertIntToFloat(
            waveBitsPerSample === 8 ? reader.readUInt8()
            : waveBitsPerSample === 16 ? reader.readInt16()
            : reader.readInt32(),
            waveBitsPerSample,
            signedBorder,
          );

          this.channelData[channel][i] = Math.min(1.0, Math.max(-1.0, value));
        }
      }

      this.tags = Wave.tags(waveFile);
    } else {
      this.sampleRate = waveFile;
      this.bitsPerSample = bitsPerSample!;
      this.channelData = channelData!;
      this.channels = channelData!.length;
      this.samplesPerChannel = channelData![0].length;
      this.tags = tags ?? {};
    }
  }

  public channelData: Float32Array[];
  public sampleRate: number;
  public bitsPerSample: number;
  public channels: number;
  public samplesPerChannel: number;
  private tags: Record<string, string>;

  public addTag(code: string, value: string): void {
    const padded = code.padStart(4, ' ');

    if (padded.length !== 4) {
      throw new TypeError('code must be a 4 character string');
    }
    this.tags[code] = value;
  }

  private tagsSectionSize(): number {
    const codeLength = Object.keys(this.tags).length * (4 + 4); // 4 for for code, 4 for the size
    const valueLength = Object.values(this.tags).reduce(
      (accumulator, tag) => accumulator + (tag == null ? 0 : Wave.len2(tag)),
      0,
    );

    return 4 + codeLength + valueLength; // add 4 for the "INFO"
  }

  private static len2(s: string): number {
    // eslint-disable-next-line no-bitwise
    return s.length + (s.length & 1);
  }
  private static str2(s: string): string {
    // eslint-disable-next-line no-bitwise
    return s + (s.length & 1 ? '\0' : '');
  }

  private tagsSectionWrite(writer: BinaryWriter): void {
    writer.writeString('INFO');
    for (const [code, value] of Object.entries(this.tags)) {
      if (!(value == null) && !(code == null)) {
        writer.writeString(`${code}    `.slice(0, 4));
        writer.writeInt32(Wave.len2(value));
        writer.writeString(Wave.str2(value));
      }
    }
  }

  public static fmt(wave: ArrayBuffer): {
    audioFormat: number;
    channels: number;
    sampleRate: number;
    blockAlign: number;
    bitsPerSample: number;
  } | null {
    const reader = new BinaryReader(wave);
    const waveChunkID = reader.readString(4);
    if (waveChunkID !== 'RIFF') {
      return null;
    }

    /* waveChunkSize */ reader.readUInt32();
    const waveFormat = reader.readString(4);
    if (waveFormat !== 'WAVE') {
      return null;
    }

    reader.gotoString('fmt ');
    /* waveSubchunk1ID */ reader.readString(4);
    /* waveSubchunk1Size */ reader.readUInt32();
    const waveAudioFormat = reader.readUInt16();
    const waveNumChannels = reader.readUInt16();
    const waveSampleRate = reader.readUInt32();
    /* waveByteRate */ reader.readUInt32();
    const waveBlockAlign = reader.readUInt16();
    const waveBitsPerSample = reader.readUInt16();

    return {
      audioFormat: waveAudioFormat,
      channels: waveNumChannels,
      sampleRate: waveSampleRate,
      blockAlign: waveBlockAlign,
      bitsPerSample: waveBitsPerSample,
    };
  }

  public static tags(wave: ArrayBuffer): Record<string, string> {
    const reader = new BinaryReader(wave);
    const tags = {} as Record<string, string>;

    reader.rewind();
    if (reader.gotoString('LIST')) {
      reader.readString(4);
      let listSize = reader.readUInt32();
      reader.readString(4);
      listSize -= 4;

      while (listSize > 0 && !reader.eof()) {
        const code = reader.readString(4);
        listSize -= 4;
        let size = reader.readUInt32();
        listSize -= 4;
        // eslint-disable-next-line no-bitwise
        size += size & 1;
        let value = reader.readString(size);
        listSize -= size;

        while (value.length > 0 && value.at(-1) === '\0') {
          value = value.slice(0, Math.max(0, value.length - 1));
        }

        tags[code] = value;
      }
    }

    return tags;
  }

  private static readonly signedBorders = [0, 0x0000007f, 0x00007fff, 0x7ffffffff];
  private static convertIntToFloat(
    value: number,
    waveBitsPerSample: number,
    signedBorder: number,
  ): number {
    return (
      waveBitsPerSample === 8 ?
        value === 0 ?
          -1.0
        : value / signedBorder - 1.0
      : value === 0 ? 0
      : value / signedBorder
    );
  }

  private static convertFloatToInt(
    value: number,
    waveBitsPerSample: number,
    signedBorder: number,
  ): number {
    return waveBitsPerSample === 8 ? (value + 1.0) * signedBorder : value * signedBorder;
  }

  public encodeWaveFile(
    sampleRate = this.sampleRate,
    _bitsPerSample = this.bitsPerSample,
  ): Uint8Array {
    if (this.sampleRate !== sampleRate) {
      this.resample(sampleRate);
    }

    // prepare variables for encoding
    const waveChunkID = 'RIFF';
    const waveFormat = 'WAVE';
    const waveSubchunk1ID = 'fmt ';
    const waveSubchunk1Size = 16;
    const waveAudioFormat = 1;
    const waveNumChannels = this.channelData.length;
    const waveSampleRate = this.sampleRate;
    const waveBitsPerSample = this.bitsPerSample;
    const waveByteRate = (waveSampleRate * waveNumChannels * waveBitsPerSample) / 8;
    const waveBlockAlign = (waveNumChannels * waveBitsPerSample) / 8;
    const waveSamplesPerChannel = this.channelData[0].length;
    const waveSubchunk2ID = 'data';
    const waveSubchunk2Size = waveSamplesPerChannel * waveBlockAlign;
    const waveSubchunk3ID = 'LIST';
    const waveSubchunk3Size = this.tagsSectionSize();
    const waveChunkSize =
      4 + (8 + waveSubchunk1Size) + (8 + waveSubchunk2Size) + (8 + waveSubchunk3Size); //4 for "RIFF" and 8 for each SubchunkID
    const totalSize = waveChunkSize + 8;
    const signBorderId = waveBitsPerSample / 8;
    const signedBorder = Wave.signedBorders[signBorderId];

    // actual writing
    const writer = new BinaryWriter(totalSize);
    writer.writeString(waveChunkID);
    writer.writeUInt32(waveChunkSize);
    writer.writeString(waveFormat);

    writer.writeString(waveSubchunk1ID);
    writer.writeUInt32(waveSubchunk1Size);
    writer.writeUInt16(waveAudioFormat);
    writer.writeUInt16(waveNumChannels);
    writer.writeUInt32(waveSampleRate);
    writer.writeUInt32(waveByteRate);
    writer.writeUInt16(waveBlockAlign);
    writer.writeUInt16(waveBitsPerSample);

    writer.writeString(waveSubchunk2ID);
    writer.writeUInt32(waveSubchunk2Size);
    for (let i = 0; i < waveSamplesPerChannel; ++i) {
      for (let channel = 0; channel < waveNumChannels; ++channel) {
        if (waveBitsPerSample === 8) {
          writer.writeInt8(
            Wave.convertFloatToInt(this.channelData[channel][i], waveBitsPerSample, signedBorder),
          );
        } else {
          writer.writeInt16(
            Wave.convertFloatToInt(this.channelData[channel][i], waveBitsPerSample, signedBorder),
          );
        }
      }
    }

    writer.writeString(waveSubchunk3ID);
    writer.writeUInt32(waveSubchunk3Size);
    this.tagsSectionWrite(writer);

    return writer.data;
  }

  private resample(sampleRate: number): void {
    const fromSampleRate = this.sampleRate;
    const toSampleRate = sampleRate;

    if (fromSampleRate > 0 && toSampleRate > 0) {
      if (fromSampleRate === toSampleRate) {
        return;
      } else if (fromSampleRate < toSampleRate) {
        /*
					Use generic linear interpolation if upsampling,
					as linear interpolation produces a gradient that we want
					and works fine with two input sample points per output in this case.
				*/
        //this.compileLinearInterpolationFunction();
        //	this.lastWeight = 1;
      } else {
        for (let channel = 0; channel < this.channels; ++channel) {
          this.channelData[channel] = this.levelAveraging(
            this.channelData[channel],
            fromSampleRate,
            toSampleRate,
          );
        }
      }

      this.sampleRate = toSampleRate;
    } else {
      throw new Error('Invalid settings specified for the resampler.');
    }
  }

  private levelAveraging(
    buffer: Float32Array,
    fromSampleRate: number,
    toSampleRate: number,
  ): Float32Array {
    const bufferLength = buffer.length;
    const ratio = fromSampleRate / toSampleRate;
    let outputOffset = 0;
    let inputOffset = 0;
    let weight = 0;
    let output = 0;
    const outputBuffer = this.createOutputBuffer(bufferLength, fromSampleRate, toSampleRate);
    let currentPosition = 0;

    do {
      weight += ratio;
      output = 0;

      while (weight > 0 && inputOffset < bufferLength) {
        const amountToNext = 1 + inputOffset - currentPosition;

        if (weight > amountToNext) {
          output += buffer[inputOffset++] * amountToNext;
          currentPosition = inputOffset;
          weight -= amountToNext;
        } else {
          output += buffer[inputOffset] * weight;
          currentPosition += weight;
          weight = 0;

          outputBuffer[outputOffset++] = output / ratio;
        }
      }
    } while (inputOffset < bufferLength);

    if (weight > 0) {
      outputBuffer[outputOffset++] = output / (ratio - weight);
    }

    return outputBuffer;
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  private createOutputBuffer(
    inputBufferSize: number,
    fromSampleRate: number,
    toSampleRate: number,
  ): Float32Array {
    return new Float32Array(
      Math.ceil(((inputBufferSize * toSampleRate) / fromSampleRate) * 1.000000476837158203125),
    );
  }

  //private		compileLinearInterpolationFunction(bufferLength)
  //{
  //	let	outputOffset	= 0;
  //	if(bufferLength > 0)
  //	{
  //		let	buffer			= this.inputBuffer;
  //		let weight			= this.lastWeight;
  //		let firstWeight		= 0;
  //		let secondWeight	= 0;
  //		let sourceOffset	= 0;
  //		let outputOffset	= 0;
  //		let outputBuffer	= this.outputBuffer;

  //		for(let weight = this.lastWeight; weight < 1; weight += this.ratioWeight)
  //		{
  //			secondWeight	= weight % 1;;
  //			firstWeight		= 1 - secondWeight;

  //			for(let channel = 0; channel < this.channels; ++channel)
  //				outputBuffer[outputOffset++] = (this.lastOutput[channel] * firstWeight) + (buffer[channel] * secondWeight);

  //			weight	= 1;
  //			for(bufferLength = this.channels, sourceOffset = Math.floor(weight) * this.channels; sourceOffset < bufferLength;)
  //			{
  //				secondWeight	= weight % 1;
  //				firstWeight		= 1 - secondWeight;

  //				for(let channel = 0; channel < this.channels; ++channel)
  //					outputBuffer[outputOffset++] = (buffer[sourceOffset + channel] * firstWeight) + (buffer[sourceOffset + channel] * secondWeight);

  //				weight			+= this.ratioWeight;
  //				sourceOffset	 = Math.floor(weight) * this.channels;
  //			}

  //			for(let channel = 0; channel < this.channels; ++channel)
  //				this.lastOutput[channel] = buffer[sourceOffset++];
  //			this.lastWeight	= weight % 1;
  //		}
  //	}

  //	return outputOffset;
  //}
}

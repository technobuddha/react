import { lerp } from '@technobuddha/library';

export class AudioChannel {
  /**
   * Create a new Audio Channel
   * @param sampleRate - The sample rate in samples per second
   * @param data - Audio data buffer
   * @param name - Name of the audio channel
   */
  public constructor(sampleRate = 0, data: Float32Array = new Float32Array(), name = 'unnamed') {
    this.name = name;
    this.sampleRate = sampleRate;
    this.data = data;
    this.gain = this.getGain();
  }

  public name: string;
  public sampleRate: number;
  public data: Float32Array;
  public gain: number;

  /**
   *	This function merges another sequence from with the same sampling rate.
   *	@param otherAudioChannel - The other sequence.
   *	@param mergePosition - Optional position where the new data should be merged (default is the end of the data block)
   */
  public merge(otherAudioChannel: AudioChannel, mergePosition = this.data.length): void {
    // requirement check
    if (otherAudioChannel.sampleRate !== this.sampleRate) {
      throw new TypeError('Sample rate does not match.');
    }
    if (mergePosition < 0 || mergePosition > this.data.length) {
      throw new TypeError('Merge position is invalid!');
    }

    const newData = new Float32Array(this.data.length + otherAudioChannel.data.length);
    newData.set(this.data.slice(0, mergePosition));
    newData.set(otherAudioChannel.data, mergePosition);
    newData.set(this.data.slice(mergePosition), otherAudioChannel.data.length + mergePosition);
    this.data = newData;
    this.gain = this.getGain();
  }

  /**
   *	Cuts off a part of the data sequence
   *	@param start - beginning of the trim
   *	@param len - optional len length of the trim (default is till the end of the data block)
   */
  public remove(start: number, len = this.data.length - start): void {
    // default parameter

    if (start >= this.data.length || start < 0) {
      throw new TypeError('The start is invalid');
    }
    if (start + len > this.data.length || len < 0) {
      throw new TypeError('The length is invalid.');
    }

    const newData = new Float32Array(this.data.length - len);
    newData.set(this.data.slice(0, start), 0);
    newData.set(this.data.slice(start + len), start);
    this.data = newData;

    // update gain value
    this.gain = this.getGain();
  }

  /**
   *	Create a clone of this sequence. Optionally the clone can be partial
   *	@param start - Optional beginning of the data block which will be cloned (default is 0)
   *	@param len - Optional len of the data block which will be cloned (default is till the end of the data block)
   */
  public clone(start = 0, len = this.data.length - start): AudioChannel {
    // default parameter

    // requirement check
    if (start < 0 || start > this.data.length) {
      throw new TypeError('Invalid start parameter.');
    }
    if (len < 0 || len + start > this.data.length) {
      throw new TypeError('Invalid len parameter.');
    }

    // create new instance and copy array elements
    return new AudioChannel(this.sampleRate, this.data.slice(start, start + len), this.name);
  }

  /**
   *	Creates a sequence with a specified length of data with value 0
   *	@param len - length of the 0 sequence
   *	@param start - optional insertion point for the 0 sequence (default is the end of the data block)
   */
  public createZeroData(len: number, start = this.data.length): void {
    const result = new Float32Array(this.data.length + len);
    result.set(this.data.slice(0, start));
    result.set(Array.from({ length: len }).fill(0) as number[], start - 1);
    result.set(this.data.slice(start), len + start - 1);
    this.data = result;
    this.gain = this.getGain();
  }

  /**
   * Copies the data into a complex array
   * @param start - optional beginning of the data point (default is 0)
   * @param len - optional length of the data sequence (default is till the end of the data block)
   */
  public toComplexSequence(start = 0, len = this.data.length - start): number[] {
    // requirement check
    if (start < 0 || start > this.data.length) {
      throw new TypeError('start parameter is invalid.');
    }
    if (len < 0 || len + start > this.data.length) {
      throw new TypeError('end parameter is invalid.');
    }

    const result = [] as number[];

    for (let i = start; i < start + len; ++i) {
      result.push(this.data[i], 0);
    }

    return result;
  }

  /**
   * Overwrites the data with the given complex array data
   * @param complexArray - the complex array which gets real value gets copied
   * @param start - optional beginning in the data point (default is 0)
   * @param len - optional length of the data sequence (default is till the end of the data block)
   */
  public fromComplexSequence(
    complexArray: number[],
    start = 0,
    len = this.data.length - start,
  ): void {
    // requirement check
    if (complexArray.length / 2 !== len) {
      throw new TypeError('length of complex array does not match');
    }
    if (complexArray.length % 2 !== 0) {
      throw new TypeError('the length of the complex array is totally wrong');
    }
    if (start < 0 || start > this.data.length) {
      throw new TypeError('start parameter is invalid.');
    }
    if (len < 0 || len + start > this.data.length) {
      throw new TypeError('end parameter is invalid.');
    }

    let complexArrayIdx = 0;
    for (let i = start; i < start + len; ++i) {
      this.data[i] = complexArray[complexArrayIdx];
      complexArrayIdx += 2;
    }

    // update gain value
    this.gain = this.getGain();
  }

  /**
   * Returns the gain (maximum amplitude)
   * @param start - Optional beginning in the data point (default is 0)
   * @param len -	Optional length of the data sequence (default is till the end of the data block)
   */
  public getGain(start = 0, len = this.data.length - start): number {
    // requirement check
    if (start < 0 || start > this.data.length) {
      throw new TypeError('start parameter is invalid.');
    }
    if (len < 0 || len + start > this.data.length) {
      throw new TypeError('end parameter is invalid.');
    }

    let result = 0.0;
    for (let i = start; i < start + len; ++i) {
      // the amplitude could be positive or negative
      const absValue = Math.abs(this.data[i]);
      result = Math.max(result, absValue);
    }
    return result;
  }

  /**
   * Returns the total length of this sequence in seconds
   */
  public getLengthInSeconds(): number {
    return this.data.length / this.sampleRate;
  }

  /**
   * Apply a normalize on the data block, which changes the data value to use the optimal bandwidth
   * @param start - optional beginning in the data point (default is 0)
   * @param len - optional length of the data sequence (default is till the end of the data block)
   */
  public filterNormalize(start = 0, len = this.data.length - start): void {
    // requirement check
    if (start < 0 || start > this.data.length) {
      throw new TypeError('start parameter is invalid.');
    }
    if (len < 0 || len + start > this.data.length) {
      throw new TypeError('end parameter is invalid.');
    }

    // do a amplitude correction of the sequence
    const gainLevel = this.getGain(start, len);
    const amplitudeCorrection = 1.0 / gainLevel;
    for (let i = start; i < start + len; ++i) {
      this.data[i] *= amplitudeCorrection;
    }

    // update gain value
    this.gain = this.getGain();
  }

  /**
   * Change the gain of the sequence. The result will give the sequence more or less amplitude
   * @param gainFactor - The factor which will be applied to the sequence
   * @param start - Optional beginning in the data point (default is 0)
   * @param len -	Optional length of the data sequence (default is till the end of the data block)
   */
  public filterGain(gainFactor: number, start = 0, len = this.data.length - start): void {
    // requirement check
    if (start < 0 || start > this.data.length) {
      throw new TypeError('start parameter is invalid.');
    }
    if (len < 0 || len + start > this.data.length) {
      throw new TypeError('end parameter is invalid.');
    }

    for (let i = start; i < start + len; ++i) {
      this.data[i] *= gainFactor;
    }

    // update gain value
    this.gain = this.getGain();
  }

  /**
   * Sets the data block to 0 (no amplitude = silence)
   * @param start - optional beginning in the data point (default is 0)
   * @param len - optional length of the data sequence (default is till the end of the data block)
   */
  public filterSilence(start?: number, len?: number): void {
    this.filterGain(0.0, start, len);
  }

  /**
   * This function applies a fade effect on a given sequence range. The value of fadeStartGainFactor and fadeEndGainFactor
   * controls if the fade is an fadein or fadeout
   * @param fadeEndGainFactor - The multiplier at the beginning of the fade
   * @param fadeEndGainFactor - The multiplier at the end of the fade
   * @param start - Optional beginning in the data point (default is 0)
   * @param len - Optional length of the data sequence (default is till the end of the data block)
   */
  public filterLinearFade(
    fadeStartGainFactor: number,
    fadeEndGainFactor: number,
    start = 0,
    len = this.data.length - start,
  ): void {
    // requirement check
    if (start < 0 || start > this.data.length) {
      throw new TypeError('start parameter is invalid.');
    }
    if (len < 0 || len + start > this.data.length) {
      throw new TypeError('end parameter is invalid.');
    }

    let fadeGainMultiplier = 0.0;
    let fadePos = 0.0;
    for (let i = start; i < start + len; ++i) {
      fadePos = (i - start) / len;
      fadeGainMultiplier = lerp(fadeStartGainFactor, fadeEndGainFactor, fadePos);

      this.data[i] *= fadeGainMultiplier;
    }

    // update gain value
    this.gain = this.getGain();
  }

  /**
   * Process an reverse of the data block
   */
  public filterReverse(): void {
    this.data.reverse();
  }

  public createTestTone(frequency: number, sampleLength: number): void {
    this.data = new Float32Array(sampleLength);
    const f = frequency / this.sampleRate;

    for (let i = 0; i < sampleLength; ++i) {
      this.data[i] = (Math.cos(2.0 * Math.PI * i * f) + Math.cos(2.0 * Math.PI * i * f * 1)) / 2;
    }
  }
}

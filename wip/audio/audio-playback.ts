namespace AudioPlayback {
  export const audioContext: AudioContext = new AudioContext();
  export let isPlaying: boolean = false;

  const bufferSize: number = 2048;
  const scriptNode: ScriptProcessorNode = audioContext.createScriptProcessor(
    bufferSize,
    1,
    2
  );
  const analyserNode: AnalyserNode = audioContext.createAnalyser();
  const playbackUpdateInterval: number = 0.05; // in Seconds

  let playStart: number = 0;
  let playEnd: number = 0;
  let isLooped: boolean = false;
  let playPosition: number[] = [];
  let sampleRate: number = 0;
  let audioData: Float32Array[] = [];
  let playbackListener: ((currentPlayPosition: number) => void) | null = null;
  let analysisListener: ((analyser: AnalyserNode) => void) | null = null;
  let lastPlaybackUpdate: number = 0;
  let startTime: number = 0;

  scriptNode.onaudioprocess = (event: AudioProcessingEvent) =>
    onAudioUpdate(event);
  analyserNode.minDecibels = -100;
  analyserNode.maxDecibels = 0;
  analyserNode.smoothingTimeConstant = 0.0;
  analyserNode.fftSize = 32;
  analyserNode.connect(audioContext.destination);

  //#region play
  interface PlayOptions {
    audioData: Float32Array[];
    sampleRate: number;
    channels: number;
    isLooped?: boolean;
    start?: number;
    end?: number;
    onPlayback?: (currentPlayPosition: number) => void;
    onAnalysis?: (analyser: AnalyserNode) => void;
  }

  export function play(options: PlayOptions) {
    // check if already playing or no data was given
    if (
      !isPlaying &&
      !_.isNil(options.audioData) &&
      options.audioData.length > 0 &&
      !_.isNil(options.sampleRate) &&
      options.sampleRate > 0
    ) {
      audioData = options.audioData;
      sampleRate = options.sampleRate;
      playbackListener = options.onPlayback;
      analysisListener = options.onAnalysis;
      isLooped = _.defaultTo(options.isLooped, false);
      playStart = _.defaultTo(options.start, 0);
      playEnd =
        _.isNil(options.end) ||
        options.end - bufferSize < options.start ||
        options.end >= audioData[0].length
          ? audioData[0].length
          : options.end;

      if (playStart < 0 || playStart >= audioData[0].length) playStart = 0;
      if (
        playEnd < 0 ||
        playEnd >= audioData[0].length ||
        playEnd - bufferSize < playStart
      )
        playEnd = audioData[0].length;

      playPosition = [playStart];
      isPlaying = true;
      lastPlaybackUpdate = 0.0;

      scriptNode.connect(analyserNode);
    }
  }
  //#endregion
  //#region stop
  export function stop() {
    if (isPlaying) {
      notifyPlayback(null);
      notifyAnalysis(null);
      halt();
    }
  }
  //#endregion
  //#region pause
  export function pause() {
    // no playing audio, nothing to pause
    if (isPlaying) {
      isPlaying = false;
      lastPlaybackUpdate = 0;

      // diconnect the node, stop!
      scriptNode.disconnect(analyserNode);

      // inform updatelistener
      notifyPlayback(null);
    }
  }
  //#endregion
  //#region resume
  export function resume() {
    // check if already playing or no data was given
    if (!isPlaying && audioData && audioData.length > 0) {
      isPlaying = true;

      // connect the node, play!
      scriptNode.connect(analyserNode);

      // inform updatelistener
      //notifyListeners(0);
    }
  }
  //#endregion
  //#region decodeAudioData
  export function decodeAudioData(
    audioData: ArrayBuffer,
    successCallback: DecodeSuccessCallback,
    errorCallback?: DecodeErrorCallback
  ): void {
    audioContext.decodeAudioData(audioData, successCallback, errorCallback);
  }
  //#endregion

  //#region onAudioUpdate
  function onAudioUpdate(event: AudioProcessingEvent) {
    if (isPlaying) {
      let elapsedTime = bufferSize / sampleRate;
      let outputBuffer = event.outputBuffer;
      let pos: number;

      playPosition.push((pos = copyChannelDataToBuffer(outputBuffer)));

      // the playback is done
      if (_.isNil(pos)) {
        halt();

        // we are done bufering, but there are still notifications left to send
        (function notify() {
          if (playPosition.length) {
            let playPos = playPosition.shift();
            notifyPlayback(playPos);
            notifyAnalysis(_.isNil(playPos) ? null : analyserNode);
            setTimeout(notify, elapsedTime * 1000); //convert seconds to milliseconds
          } else {
            // set all playback information to default
            playStart = 0;
            playEnd = 0;
            isLooped = false;
            lastPlaybackUpdate = 0;
            audioData = [];
            sampleRate = 0;
            playbackListener = null;
            analysisListener = null;
          }
        })();
      } else {
        lastPlaybackUpdate -= elapsedTime;

        // The maximum buffer size for the audio system is 16k, I'm guessing that they are double bufferring
        if (playPosition.length > 32768 / bufferSize) {
          let pp = playPosition.shift();

          if (lastPlaybackUpdate < 0) {
            lastPlaybackUpdate = playbackUpdateInterval;
            notifyPlayback(pp);
            notifyAnalysis(analyserNode);
          }
        }
      }
    }
  }
  //#endregion
  //#region copyChannelDataToBuffer
  function copyChannelDataToBuffer(audioBuffer: AudioBuffer): number {
    /**
     *	In order to enable looping, we should need to split up when the end of the audio data is reached
     *	to begin with the first position. Therefore is a split into two ranges if neccessary
     */
    let returnValue: number;
    let position = _.last(playPosition);

    _.each(
      _.map([0, 1], (i) => ({
        buffer: audioBuffer.getChannelData(i),
        audioDatum: audioData.length == 1 ? audioData[0] : audioData[i],
      })),
      function (args) {
        let buffer = args.buffer as Float32Array;
        let audioDatum = args.audioDatum as Float32Array;

        let start = position;
        let end =
          start + bufferSize > audioDatum.length
            ? audioDatum.length
            : start + bufferSize > playEnd
            ? playEnd
            : start + bufferSize;
        let length = end - start;

        if (isLooped) {
          copyIntoBuffer(buffer, 0, audioDatum, start, end);

          while (length < bufferSize) {
            start = playStart;
            end =
              start + (bufferSize - length) > audioDatum.length
                ? audioDatum.length
                : start + (bufferSize - length) > playEnd
                ? playEnd
                : start + (bufferSize - length);

            copyIntoBuffer(buffer, length, audioDatum, start, end);
            length = length + end - start;
          }
        }

        if (length === 0) {
          zeroBuffer(buffer, 0);
          returnValue = null;
        } else {
          copyIntoBuffer(buffer, 0, audioDatum, start, end);
          zeroBuffer(buffer, end);
          returnValue = end;
        }
      }
    );

    return returnValue;
  }
  //#endregion
  //#region copyIntoBuffer
  function copyIntoBuffer(
    buffer: Float32Array,
    bufferOffset: number,
    data: Float32Array,
    dataOffset: number,
    dataEnd: number
  ): void {
    buffer.set(data.slice(dataOffset, dataEnd), bufferOffset);
  }
  //#endregion
  //#region zeroBuffer
  function zeroBuffer(buffer: Float32Array, bufferOffset: number) {
    for (; bufferOffset < buffer.length; ++bufferOffset)
      buffer[bufferOffset] = 0;
  }
  //#endregion
  //#region halt
  function halt() {
    // no playing audio, nothing to stop
    if (isPlaying) {
      isPlaying = false;

      // diconnect the node, stop!
      scriptNode.disconnect(analyserNode);
    }
  }
  //#endregion
  //#region notifyPlayback
  function notifyPlayback(time: number) {
    if (!_.isNil(playbackListener)) playbackListener(time);
  }
  //#endregion
  //#region notifyAnalysis
  function notifyAnalysis(analyser: AnalyserNode) {
    if (!_.isNil(analysisListener)) analysisListener(analyser);
  }
  //#endregion
}

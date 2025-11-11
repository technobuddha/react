export class BinaryReader {
  //#region constructor
  public constructor(data: ArrayBuffer) {
    this.data = new Uint8Array(data);
    this.pos = 0;
  }
  //#endregion
  //#region properties
  private pos: number;
  private readonly data: Uint8Array;

  private static readonly signMasks: number[] = [0x0, 0x80, 0x8000, 0x800000, 0x80000000];
  private static readonly masks: number[] = [
    0x0,
    0xff + 1,
    0xffff + 1,
    0xffffff + 1,
    0xffffffff + 1,
  ];
  //#endregion

  //#region rewind
  public rewind(): void {
    this.pos = 0;
  }
  //#endregion
  //#region gotoString
  public gotoString(value: string): boolean {
    const padded = value.padEnd(4, ' ').slice(0, 4); //Make sure the search string is exactly 4 characters;

    while (!this.eof()) {
      const code = this.readString(4);
      if (code === padded) {
        this.pos -= 4;
        return true;
      }
    }

    return false;
  }
  //#endregion
  //#region readUInt8
  public readUInt8(bigEndian = false): number {
    return this.readInteger(1, false, bigEndian);
  }
  //#endregion
  //#region readInt8
  public readInt8(bigEndian = false): number {
    return this.readInteger(1, true, bigEndian);
  }
  //#endregion
  //#region readUInt16
  public readUInt16(bigEndian = false): number {
    return this.readInteger(2, false, bigEndian);
  }
  //#endregion
  //#region readInt16
  public readInt16(bigEndian = false): number {
    return this.readInteger(2, true, bigEndian);
  }
  //#endregion
  //#region readUInt32
  public readUInt32(bigEndian = false): number {
    return this.readInteger(4, false, bigEndian);
  }
  //#endregion
  //#region readInt32
  public readInt32(bigEndian = false): number {
    return this.readInteger(4, true, bigEndian);
  }
  //#endregion
  //#region readString
  public readString(size: number): string {
    let r = '';
    let i = 0;

    // eslint-disable-next-line unicorn/prefer-code-point
    for (i = 0; i < size; ++i) {
      r += String.fromCharCode(this.data[this.pos++]);
    }

    while (r.length > 0 && r.at(-1) === '\0') {
      r = r.slice(0, -1);
    }
    return r;
  }
  //#endregion
  //#region eof
  public eof(): boolean {
    return this.data.length <= this.pos;
  }
  //#endregion

  //#region readInteger
  /* size = size in bytes (e.g. 1 = 8 bits, ...)
   * signed = boolean flag to define if the value is signed
   * bigEndian = boolean flag to define the decoding in big endian style
   */
  private readInteger(size: number, signed: boolean, bigEndian: boolean): number {
    if (this.pos + (size - 1) >= this.data.length) {
      throw new Error('Buffer overflow during reading.');
    }

    let i = 0;
    let r = 0;

    // read the bytes
    for (i = 0; i < size; ++i) {
      // eslint-disable-next-line no-bitwise
      if (bigEndian) {
        r = this.data[this.pos++] + (r << (i * 8));
      }
      // eslint-disable-next-line no-bitwise
      else {
        r += this.data[this.pos++] << (i * 8);
      }
    }

    // convert from unsigned to signed
    // eslint-disable-next-line no-bitwise
    if (signed && r & BinaryReader.signMasks[size]) {
      r -= BinaryReader.masks[size];
    }

    return r;
  }
  //#endregion
}

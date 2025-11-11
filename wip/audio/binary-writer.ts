export class BinaryWriter {
  //#region constructor
  public constructor(size: number) {
    this.pos = 0;
    this.data = new Uint8Array(size);
  }
  //#endregion

  //#region properties
  public pos: number;
  public data: Uint8Array;

  private static readonly masks: number[] = [
    0x0,
    0xff + 1,
    0xffff + 1,
    0xffffff + 1,
    0xffffffff + 1,
  ];
  //#endregion

  //#region writeUint8
  public writeUInt8(value: number, bigEndian = false): void {
    this.writeInteger(value, 1, bigEndian);
  }
  //#endregion
  //#region writeInt8
  public writeInt8(value: number, bigEndian = false): void {
    this.writeInteger(value, 1, bigEndian);
  }
  //#endregion
  //#region writeUnit16
  public writeUInt16(value: number, bigEndian = false): void {
    this.writeInteger(value, 2, bigEndian);
  }
  //#endregion
  //#region writeInt16
  public writeInt16(value: number, bigEndian = false): void {
    this.writeInteger(value, 2, bigEndian);
  }
  //#endregion
  //#region writeUInt32
  public writeUInt32(value: number, bigEndian = false): void {
    this.writeInteger(value, 4, bigEndian);
  }
  //#endregion
  //#region writeInt32
  public writeInt32(value: number, bigEndian = false): void {
    this.writeInteger(value, 4, bigEndian);
  }
  //#endregion
  //#region writeString
  public writeString(value: string): void {
    for (let i = 0; i < value.length; ++i) {
      // eslint-disable-next-line unicorn/prefer-code-point
      this.data[this.pos++] = value.charCodeAt(i);
    }
  }
  //#endregion

  //#region writeInteger
  /**	value		the actual value which want to get stored
   *	size		size in bytes of the value
   *	bigEndian	flag to store the number in big endian style
   */
  private writeInteger(value: number, size: number, bigEndian: boolean): void {
    let r = value;

    // convert to unsigned if value is negative
    if (value < 0) {
      r += BinaryWriter.masks[size];
    }

    // write the bytes
    for (let i = 0; i < size; ++i) {
      if (bigEndian) {
        // eslint-disable-next-line no-bitwise
        this.data[this.pos++] = (r >> ((size - i - 1) * 8)) & 0xff;
      } else {
        // eslint-disable-next-line no-bitwise
        this.data[this.pos++] = (r >> (i * 8)) & 0xff;
      }
    }
  }
  //#endregion
}

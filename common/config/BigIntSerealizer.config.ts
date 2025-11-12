export function BigIntSerealizer() {
  return (BigInt.prototype['toJSON'] = function (): number | string {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
  });
}

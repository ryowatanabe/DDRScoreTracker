export class Statistics {
  static max(values: number[]): number | null {
    if (!Array.isArray(values)) {
      return null;
    }
    if (values.length === 0) {
      return null;
    }
    let copy = values.slice();
    return copy.sort((a, b) => {
      return b - a;
    })[0];
  }

  static min(values: number[]): number | null {
    if (!Array.isArray(values)) {
      return null;
    }
    if (values.length === 0) {
      return null;
    }
    let copy = values.slice();
    return copy.sort((a, b) => {
      return a - b;
    })[0];
  }

  static average(values: number[]): number | null {
    if (!Array.isArray(values)) {
      return null;
    }
    if (values.length === 0) {
      return null;
    }
    return (
      values.reduce((acc, cur) => {
        return acc + cur;
      }) / values.length
    );
  }

  static median(values: number[]): number | null {
    if (!Array.isArray(values)) {
      return null;
    }
    if (values.length === 0) {
      return null;
    }
    let copy = values.slice();
    copy.sort((a, b) => {
      return a - b;
    });
    return this.average([copy[Math.floor((copy.length - 1) / 2)], copy[Math.ceil((copy.length - 1) / 2)]]);
  }
}

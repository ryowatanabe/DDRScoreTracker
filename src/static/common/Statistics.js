export class Statistics {
  static max(values) {
    if (!Array.isArray(values)) {
      return null;
    }
    if (values.length == 0) {
      return null;
    }
    return values.sort((a, b) => {
      return b - a;
    })[0];
  }

  static min(values) {
    if (!Array.isArray(values)) {
      return null;
    }
    if (values.length == 0) {
      return null;
    }
    return values.sort((a, b) => {
      return a - b;
    })[0];
  }

  static average(values) {
    if (!Array.isArray(values)) {
      return null;
    }
    if (values.length == 0) {
      return null;
    }
    return (
      values.reduce((acc, cur) => {
        return acc + cur;
      }) / values.length
    );
  }

  static median(values) {
    if (!Array.isArray(values)) {
      return null;
    }
    if (values.length == 0) {
      return null;
    }
    values.sort((a, b) => {
      return a - b;
    });
    return this.average([values[Math.floor((values.length - 1) / 2)], values[Math.ceil((values.length - 1) / 2)]]);
  }
}

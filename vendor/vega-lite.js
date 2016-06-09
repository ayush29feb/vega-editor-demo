(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.vl = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define('d3-time', ['exports'], factory) :
  factory((global.d3_time = {}));
}(this, function (exports) { 'use strict';

  var t0 = new Date;
  var t1 = new Date;
  function newInterval(floori, offseti, count, field) {

    function interval(date) {
      return floori(date = new Date(+date)), date;
    }

    interval.floor = interval;

    interval.round = function(date) {
      var d0 = new Date(+date),
          d1 = new Date(date - 1);
      floori(d0), floori(d1), offseti(d1, 1);
      return date - d0 < d1 - date ? d0 : d1;
    };

    interval.ceil = function(date) {
      return floori(date = new Date(date - 1)), offseti(date, 1), date;
    };

    interval.offset = function(date, step) {
      return offseti(date = new Date(+date), step == null ? 1 : Math.floor(step)), date;
    };

    interval.range = function(start, stop, step) {
      var range = [];
      start = new Date(start - 1);
      stop = new Date(+stop);
      step = step == null ? 1 : Math.floor(step);
      if (!(start < stop) || !(step > 0)) return range; // also handles Invalid Date
      offseti(start, 1), floori(start);
      if (start < stop) range.push(new Date(+start));
      while (offseti(start, step), floori(start), start < stop) range.push(new Date(+start));
      return range;
    };

    interval.filter = function(test) {
      return newInterval(function(date) {
        while (floori(date), !test(date)) date.setTime(date - 1);
      }, function(date, step) {
        while (--step >= 0) while (offseti(date, 1), !test(date));
      });
    };

    if (count) {
      interval.count = function(start, end) {
        t0.setTime(+start), t1.setTime(+end);
        floori(t0), floori(t1);
        return Math.floor(count(t0, t1));
      };

      interval.every = function(step) {
        step = Math.floor(step);
        return !isFinite(step) || !(step > 0) ? null
            : !(step > 1) ? interval
            : interval.filter(field
                ? function(d) { return field(d) % step === 0; }
                : function(d) { return interval.count(0, d) % step === 0; });
      };
    }

    return interval;
  };

  var millisecond = newInterval(function() {
    // noop
  }, function(date, step) {
    date.setTime(+date + step);
  }, function(start, end) {
    return end - start;
  });

  // An optimized implementation for this simple case.
  millisecond.every = function(k) {
    k = Math.floor(k);
    if (!isFinite(k) || !(k > 0)) return null;
    if (!(k > 1)) return millisecond;
    return newInterval(function(date) {
      date.setTime(Math.floor(date / k) * k);
    }, function(date, step) {
      date.setTime(+date + step * k);
    }, function(start, end) {
      return (end - start) / k;
    });
  };

  var second = newInterval(function(date) {
    date.setMilliseconds(0);
  }, function(date, step) {
    date.setTime(+date + step * 1e3);
  }, function(start, end) {
    return (end - start) / 1e3;
  }, function(date) {
    return date.getSeconds();
  });

  var minute = newInterval(function(date) {
    date.setSeconds(0, 0);
  }, function(date, step) {
    date.setTime(+date + step * 6e4);
  }, function(start, end) {
    return (end - start) / 6e4;
  }, function(date) {
    return date.getMinutes();
  });

  var hour = newInterval(function(date) {
    date.setMinutes(0, 0, 0);
  }, function(date, step) {
    date.setTime(+date + step * 36e5);
  }, function(start, end) {
    return (end - start) / 36e5;
  }, function(date) {
    return date.getHours();
  });

  var day = newInterval(function(date) {
    date.setHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setDate(date.getDate() + step);
  }, function(start, end) {
    return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * 6e4) / 864e5;
  }, function(date) {
    return date.getDate() - 1;
  });

  function weekday(i) {
    return newInterval(function(date) {
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (date.getDay() + 7 - i) % 7);
    }, function(date, step) {
      date.setDate(date.getDate() + step * 7);
    }, function(start, end) {
      return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * 6e4) / 6048e5;
    });
  }

  var sunday = weekday(0);
  var monday = weekday(1);
  var tuesday = weekday(2);
  var wednesday = weekday(3);
  var thursday = weekday(4);
  var friday = weekday(5);
  var saturday = weekday(6);

  var month = newInterval(function(date) {
    date.setHours(0, 0, 0, 0);
    date.setDate(1);
  }, function(date, step) {
    date.setMonth(date.getMonth() + step);
  }, function(start, end) {
    return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
  }, function(date) {
    return date.getMonth();
  });

  var year = newInterval(function(date) {
    date.setHours(0, 0, 0, 0);
    date.setMonth(0, 1);
  }, function(date, step) {
    date.setFullYear(date.getFullYear() + step);
  }, function(start, end) {
    return end.getFullYear() - start.getFullYear();
  }, function(date) {
    return date.getFullYear();
  });

  var utcSecond = newInterval(function(date) {
    date.setUTCMilliseconds(0);
  }, function(date, step) {
    date.setTime(+date + step * 1e3);
  }, function(start, end) {
    return (end - start) / 1e3;
  }, function(date) {
    return date.getUTCSeconds();
  });

  var utcMinute = newInterval(function(date) {
    date.setUTCSeconds(0, 0);
  }, function(date, step) {
    date.setTime(+date + step * 6e4);
  }, function(start, end) {
    return (end - start) / 6e4;
  }, function(date) {
    return date.getUTCMinutes();
  });

  var utcHour = newInterval(function(date) {
    date.setUTCMinutes(0, 0, 0);
  }, function(date, step) {
    date.setTime(+date + step * 36e5);
  }, function(start, end) {
    return (end - start) / 36e5;
  }, function(date) {
    return date.getUTCHours();
  });

  var utcDay = newInterval(function(date) {
    date.setUTCHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setUTCDate(date.getUTCDate() + step);
  }, function(start, end) {
    return (end - start) / 864e5;
  }, function(date) {
    return date.getUTCDate() - 1;
  });

  function utcWeekday(i) {
    return newInterval(function(date) {
      date.setUTCHours(0, 0, 0, 0);
      date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - i) % 7);
    }, function(date, step) {
      date.setUTCDate(date.getUTCDate() + step * 7);
    }, function(start, end) {
      return (end - start) / 6048e5;
    });
  }

  var utcSunday = utcWeekday(0);
  var utcMonday = utcWeekday(1);
  var utcTuesday = utcWeekday(2);
  var utcWednesday = utcWeekday(3);
  var utcThursday = utcWeekday(4);
  var utcFriday = utcWeekday(5);
  var utcSaturday = utcWeekday(6);

  var utcMonth = newInterval(function(date) {
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(1);
  }, function(date, step) {
    date.setUTCMonth(date.getUTCMonth() + step);
  }, function(start, end) {
    return end.getUTCMonth() - start.getUTCMonth() + (end.getUTCFullYear() - start.getUTCFullYear()) * 12;
  }, function(date) {
    return date.getUTCMonth();
  });

  var utcYear = newInterval(function(date) {
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCMonth(0, 1);
  }, function(date, step) {
    date.setUTCFullYear(date.getUTCFullYear() + step);
  }, function(start, end) {
    return end.getUTCFullYear() - start.getUTCFullYear();
  }, function(date) {
    return date.getUTCFullYear();
  });

  var milliseconds = millisecond.range;
  var seconds = second.range;
  var minutes = minute.range;
  var hours = hour.range;
  var days = day.range;
  var sundays = sunday.range;
  var mondays = monday.range;
  var tuesdays = tuesday.range;
  var wednesdays = wednesday.range;
  var thursdays = thursday.range;
  var fridays = friday.range;
  var saturdays = saturday.range;
  var weeks = sunday.range;
  var months = month.range;
  var years = year.range;

  var utcMillisecond = millisecond;
  var utcMilliseconds = milliseconds;
  var utcSeconds = utcSecond.range;
  var utcMinutes = utcMinute.range;
  var utcHours = utcHour.range;
  var utcDays = utcDay.range;
  var utcSundays = utcSunday.range;
  var utcMondays = utcMonday.range;
  var utcTuesdays = utcTuesday.range;
  var utcWednesdays = utcWednesday.range;
  var utcThursdays = utcThursday.range;
  var utcFridays = utcFriday.range;
  var utcSaturdays = utcSaturday.range;
  var utcWeeks = utcSunday.range;
  var utcMonths = utcMonth.range;
  var utcYears = utcYear.range;

  var version = "0.1.1";

  exports.version = version;
  exports.milliseconds = milliseconds;
  exports.seconds = seconds;
  exports.minutes = minutes;
  exports.hours = hours;
  exports.days = days;
  exports.sundays = sundays;
  exports.mondays = mondays;
  exports.tuesdays = tuesdays;
  exports.wednesdays = wednesdays;
  exports.thursdays = thursdays;
  exports.fridays = fridays;
  exports.saturdays = saturdays;
  exports.weeks = weeks;
  exports.months = months;
  exports.years = years;
  exports.utcMillisecond = utcMillisecond;
  exports.utcMilliseconds = utcMilliseconds;
  exports.utcSeconds = utcSeconds;
  exports.utcMinutes = utcMinutes;
  exports.utcHours = utcHours;
  exports.utcDays = utcDays;
  exports.utcSundays = utcSundays;
  exports.utcMondays = utcMondays;
  exports.utcTuesdays = utcTuesdays;
  exports.utcWednesdays = utcWednesdays;
  exports.utcThursdays = utcThursdays;
  exports.utcFridays = utcFridays;
  exports.utcSaturdays = utcSaturdays;
  exports.utcWeeks = utcWeeks;
  exports.utcMonths = utcMonths;
  exports.utcYears = utcYears;
  exports.millisecond = millisecond;
  exports.second = second;
  exports.minute = minute;
  exports.hour = hour;
  exports.day = day;
  exports.sunday = sunday;
  exports.monday = monday;
  exports.tuesday = tuesday;
  exports.wednesday = wednesday;
  exports.thursday = thursday;
  exports.friday = friday;
  exports.saturday = saturday;
  exports.week = sunday;
  exports.month = month;
  exports.year = year;
  exports.utcSecond = utcSecond;
  exports.utcMinute = utcMinute;
  exports.utcHour = utcHour;
  exports.utcDay = utcDay;
  exports.utcSunday = utcSunday;
  exports.utcMonday = utcMonday;
  exports.utcTuesday = utcTuesday;
  exports.utcWednesday = utcWednesday;
  exports.utcThursday = utcThursday;
  exports.utcFriday = utcFriday;
  exports.utcSaturday = utcSaturday;
  exports.utcWeek = utcSunday;
  exports.utcMonth = utcMonth;
  exports.utcYear = utcYear;
  exports.interval = newInterval;

}));
},{}],3:[function(require,module,exports){
var util = require('../util'),
    time = require('../time'),
    EPSILON = 1e-15;

function bins(opt) {
  if (!opt) { throw Error("Missing binning options."); }

  // determine range
  var maxb = opt.maxbins || 15,
      base = opt.base || 10,
      logb = Math.log(base),
      div = opt.div || [5, 2],
      min = opt.min,
      max = opt.max,
      span = max - min,
      step, level, minstep, precision, v, i, eps;

  if (opt.step) {
    // if step size is explicitly given, use that
    step = opt.step;
  } else if (opt.steps) {
    // if provided, limit choice to acceptable step sizes
    step = opt.steps[Math.min(
      opt.steps.length - 1,
      bisect(opt.steps, span/maxb, 0, opt.steps.length)
    )];
  } else {
    // else use span to determine step size
    level = Math.ceil(Math.log(maxb) / logb);
    minstep = opt.minstep || 0;
    step = Math.max(
      minstep,
      Math.pow(base, Math.round(Math.log(span) / logb) - level)
    );

    // increase step size if too many bins
    while (Math.ceil(span/step) > maxb) { step *= base; }

    // decrease step size if allowed
    for (i=0; i<div.length; ++i) {
      v = step / div[i];
      if (v >= minstep && span / v <= maxb) step = v;
    }
  }

  // update precision, min and max
  v = Math.log(step);
  precision = v >= 0 ? 0 : ~~(-v / logb) + 1;
  eps = Math.pow(base, -precision - 1);
  min = Math.min(min, Math.floor(min / step + eps) * step);
  max = Math.ceil(max / step) * step;

  return {
    start: min,
    stop:  max,
    step:  step,
    unit:  {precision: precision},
    value: value,
    index: index
  };
}

function bisect(a, x, lo, hi) {
  while (lo < hi) {
    var mid = lo + hi >>> 1;
    if (util.cmp(a[mid], x) < 0) { lo = mid + 1; }
    else { hi = mid; }
  }
  return lo;
}

function value(v) {
  return this.step * Math.floor(v / this.step + EPSILON);
}

function index(v) {
  return Math.floor((v - this.start) / this.step + EPSILON);
}

function date_value(v) {
  return this.unit.date(value.call(this, v));
}

function date_index(v) {
  return index.call(this, this.unit.unit(v));
}

bins.date = function(opt) {
  if (!opt) { throw Error("Missing date binning options."); }

  // find time step, then bin
  var units = opt.utc ? time.utc : time,
      dmin = opt.min,
      dmax = opt.max,
      maxb = opt.maxbins || 20,
      minb = opt.minbins || 4,
      span = (+dmax) - (+dmin),
      unit = opt.unit ? units[opt.unit] : units.find(span, minb, maxb),
      spec = bins({
        min:     unit.min != null ? unit.min : unit.unit(dmin),
        max:     unit.max != null ? unit.max : unit.unit(dmax),
        maxbins: maxb,
        minstep: unit.minstep,
        steps:   unit.step
      });

  spec.unit = unit;
  spec.index = date_index;
  if (!opt.raw) spec.value = date_value;
  return spec;
};

module.exports = bins;

},{"../time":5,"../util":6}],4:[function(require,module,exports){
var util = require('./util'),
    gen = module.exports;

gen.repeat = function(val, n) {
  var a = Array(n), i;
  for (i=0; i<n; ++i) a[i] = val;
  return a;
};

gen.zeros = function(n) {
  return gen.repeat(0, n);
};

gen.range = function(start, stop, step) {
  if (arguments.length < 3) {
    step = 1;
    if (arguments.length < 2) {
      stop = start;
      start = 0;
    }
  }
  if ((stop - start) / step == Infinity) throw new Error('Infinite range');
  var range = [], i = -1, j;
  if (step < 0) while ((j = start + step * ++i) > stop) range.push(j);
  else while ((j = start + step * ++i) < stop) range.push(j);
  return range;
};

gen.random = {};

gen.random.uniform = function(min, max) {
  if (max === undefined) {
    max = min === undefined ? 1 : min;
    min = 0;
  }
  var d = max - min;
  var f = function() {
    return min + d * Math.random();
  };
  f.samples = function(n) {
    return gen.zeros(n).map(f);
  };
  f.pdf = function(x) {
    return (x >= min && x <= max) ? 1/d : 0;
  };
  f.cdf = function(x) {
    return x < min ? 0 : x > max ? 1 : (x - min) / d;
  };
  f.icdf = function(p) {
    return (p >= 0 && p <= 1) ? min + p*d : NaN;
  };
  return f;
};

gen.random.integer = function(a, b) {
  if (b === undefined) {
    b = a;
    a = 0;
  }
  var d = b - a;
  var f = function() {
    return a + Math.floor(d * Math.random());
  };
  f.samples = function(n) {
    return gen.zeros(n).map(f);
  };
  f.pdf = function(x) {
    return (x === Math.floor(x) && x >= a && x < b) ? 1/d : 0;
  };
  f.cdf = function(x) {
    var v = Math.floor(x);
    return v < a ? 0 : v >= b ? 1 : (v - a + 1) / d;
  };
  f.icdf = function(p) {
    return (p >= 0 && p <= 1) ? a - 1 + Math.floor(p*d) : NaN;
  };
  return f;
};

gen.random.normal = function(mean, stdev) {
  mean = mean || 0;
  stdev = stdev || 1;
  var next;
  var f = function() {
    var x = 0, y = 0, rds, c;
    if (next !== undefined) {
      x = next;
      next = undefined;
      return x;
    }
    do {
      x = Math.random()*2-1;
      y = Math.random()*2-1;
      rds = x*x + y*y;
    } while (rds === 0 || rds > 1);
    c = Math.sqrt(-2*Math.log(rds)/rds); // Box-Muller transform
    next = mean + y*c*stdev;
    return mean + x*c*stdev;
  };
  f.samples = function(n) {
    return gen.zeros(n).map(f);
  };
  f.pdf = function(x) {
    var exp = Math.exp(Math.pow(x-mean, 2) / (-2 * Math.pow(stdev, 2)));
    return (1 / (stdev * Math.sqrt(2*Math.PI))) * exp;
  };
  f.cdf = function(x) {
    // Approximation from West (2009)
    // Better Approximations to Cumulative Normal Functions
    var cd,
        z = (x - mean) / stdev,
        Z = Math.abs(z);
    if (Z > 37) {
      cd = 0;
    } else {
      var sum, exp = Math.exp(-Z*Z/2);
      if (Z < 7.07106781186547) {
        sum = 3.52624965998911e-02 * Z + 0.700383064443688;
        sum = sum * Z + 6.37396220353165;
        sum = sum * Z + 33.912866078383;
        sum = sum * Z + 112.079291497871;
        sum = sum * Z + 221.213596169931;
        sum = sum * Z + 220.206867912376;
        cd = exp * sum;
        sum = 8.83883476483184e-02 * Z + 1.75566716318264;
        sum = sum * Z + 16.064177579207;
        sum = sum * Z + 86.7807322029461;
        sum = sum * Z + 296.564248779674;
        sum = sum * Z + 637.333633378831;
        sum = sum * Z + 793.826512519948;
        sum = sum * Z + 440.413735824752;
        cd = cd / sum;
      } else {
        sum = Z + 0.65;
        sum = Z + 4 / sum;
        sum = Z + 3 / sum;
        sum = Z + 2 / sum;
        sum = Z + 1 / sum;
        cd = exp / sum / 2.506628274631;
      }
    }
    return z > 0 ? 1 - cd : cd;
  };
  f.icdf = function(p) {
    // Approximation of Probit function using inverse error function.
    if (p <= 0 || p >= 1) return NaN;
    var x = 2*p - 1,
        v = (8 * (Math.PI - 3)) / (3 * Math.PI * (4-Math.PI)),
        a = (2 / (Math.PI*v)) + (Math.log(1 - Math.pow(x,2)) / 2),
        b = Math.log(1 - (x*x)) / v,
        s = (x > 0 ? 1 : -1) * Math.sqrt(Math.sqrt((a*a) - b) - a);
    return mean + stdev * Math.SQRT2 * s;
  };
  return f;
};

gen.random.bootstrap = function(domain, smooth) {
  // Generates a bootstrap sample from a set of observations.
  // Smooth bootstrapping adds random zero-centered noise to the samples.
  var val = domain.filter(util.isValid),
      len = val.length,
      err = smooth ? gen.random.normal(0, smooth) : null;
  var f = function() {
    return val[~~(Math.random()*len)] + (err ? err() : 0);
  };
  f.samples = function(n) {
    return gen.zeros(n).map(f);
  };
  return f;
};
},{"./util":6}],5:[function(require,module,exports){
var d3_time = require('d3-time');

var tempDate = new Date(),
    baseDate = new Date(0, 0, 1).setFullYear(0), // Jan 1, 0 AD
    utcBaseDate = new Date(Date.UTC(0, 0, 1)).setUTCFullYear(0);

function date(d) {
  return (tempDate.setTime(+d), tempDate);
}

// create a time unit entry
function entry(type, date, unit, step, min, max) {
  var e = {
    type: type,
    date: date,
    unit: unit
  };
  if (step) {
    e.step = step;
  } else {
    e.minstep = 1;
  }
  if (min != null) e.min = min;
  if (max != null) e.max = max;
  return e;
}

function create(type, unit, base, step, min, max) {
  return entry(type,
    function(d) { return unit.offset(base, d); },
    function(d) { return unit.count(base, d); },
    step, min, max);
}

var locale = [
  create('second', d3_time.second, baseDate),
  create('minute', d3_time.minute, baseDate),
  create('hour',   d3_time.hour,   baseDate),
  create('day',    d3_time.day,    baseDate, [1, 7]),
  create('month',  d3_time.month,  baseDate, [1, 3, 6]),
  create('year',   d3_time.year,   baseDate),

  // periodic units
  entry('seconds',
    function(d) { return new Date(1970, 0, 1, 0, 0, d); },
    function(d) { return date(d).getSeconds(); },
    null, 0, 59
  ),
  entry('minutes',
    function(d) { return new Date(1970, 0, 1, 0, d); },
    function(d) { return date(d).getMinutes(); },
    null, 0, 59
  ),
  entry('hours',
    function(d) { return new Date(1970, 0, 1, d); },
    function(d) { return date(d).getHours(); },
    null, 0, 23
  ),
  entry('weekdays',
    function(d) { return new Date(1970, 0, 4+d); },
    function(d) { return date(d).getDay(); },
    [1], 0, 6
  ),
  entry('dates',
    function(d) { return new Date(1970, 0, d); },
    function(d) { return date(d).getDate(); },
    [1], 1, 31
  ),
  entry('months',
    function(d) { return new Date(1970, d % 12, 1); },
    function(d) { return date(d).getMonth(); },
    [1], 0, 11
  )
];

var utc = [
  create('second', d3_time.utcSecond, utcBaseDate),
  create('minute', d3_time.utcMinute, utcBaseDate),
  create('hour',   d3_time.utcHour,   utcBaseDate),
  create('day',    d3_time.utcDay,    utcBaseDate, [1, 7]),
  create('month',  d3_time.utcMonth,  utcBaseDate, [1, 3, 6]),
  create('year',   d3_time.utcYear,   utcBaseDate),

  // periodic units
  entry('seconds',
    function(d) { return new Date(Date.UTC(1970, 0, 1, 0, 0, d)); },
    function(d) { return date(d).getUTCSeconds(); },
    null, 0, 59
  ),
  entry('minutes',
    function(d) { return new Date(Date.UTC(1970, 0, 1, 0, d)); },
    function(d) { return date(d).getUTCMinutes(); },
    null, 0, 59
  ),
  entry('hours',
    function(d) { return new Date(Date.UTC(1970, 0, 1, d)); },
    function(d) { return date(d).getUTCHours(); },
    null, 0, 23
  ),
  entry('weekdays',
    function(d) { return new Date(Date.UTC(1970, 0, 4+d)); },
    function(d) { return date(d).getUTCDay(); },
    [1], 0, 6
  ),
  entry('dates',
    function(d) { return new Date(Date.UTC(1970, 0, d)); },
    function(d) { return date(d).getUTCDate(); },
    [1], 1, 31
  ),
  entry('months',
    function(d) { return new Date(Date.UTC(1970, d % 12, 1)); },
    function(d) { return date(d).getUTCMonth(); },
    [1], 0, 11
  )
];

var STEPS = [
  [31536e6, 5],  // 1-year
  [7776e6, 4],   // 3-month
  [2592e6, 4],   // 1-month
  [12096e5, 3],  // 2-week
  [6048e5, 3],   // 1-week
  [1728e5, 3],   // 2-day
  [864e5, 3],    // 1-day
  [432e5, 2],    // 12-hour
  [216e5, 2],    // 6-hour
  [108e5, 2],    // 3-hour
  [36e5, 2],     // 1-hour
  [18e5, 1],     // 30-minute
  [9e5, 1],      // 15-minute
  [3e5, 1],      // 5-minute
  [6e4, 1],      // 1-minute
  [3e4, 0],      // 30-second
  [15e3, 0],     // 15-second
  [5e3, 0],      // 5-second
  [1e3, 0]       // 1-second
];

function find(units, span, minb, maxb) {
  var step = STEPS[0], i, n, bins;

  for (i=1, n=STEPS.length; i<n; ++i) {
    step = STEPS[i];
    if (span > step[0]) {
      bins = span / step[0];
      if (bins > maxb) {
        return units[STEPS[i-1][1]];
      }
      if (bins >= minb) {
        return units[step[1]];
      }
    }
  }
  return units[STEPS[n-1][1]];
}

function toUnitMap(units) {
  var map = {}, i, n;
  for (i=0, n=units.length; i<n; ++i) {
    map[units[i].type] = units[i];
  }
  map.find = function(span, minb, maxb) {
    return find(units, span, minb, maxb);
  };
  return map;
}

module.exports = toUnitMap(locale);
module.exports.utc = toUnitMap(utc);
},{"d3-time":2}],6:[function(require,module,exports){
(function (Buffer){
var u = module.exports;

// utility functions

var FNAME = '__name__';

u.namedfunc = function(name, f) { return (f[FNAME] = name, f); };

u.name = function(f) { return f==null ? null : f[FNAME]; };

u.identity = function(x) { return x; };

u.true = u.namedfunc('true', function() { return true; });

u.false = u.namedfunc('false', function() { return false; });

u.duplicate = function(obj) {
  return JSON.parse(JSON.stringify(obj));
};

u.equal = function(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
};

u.extend = function(obj) {
  for (var x, name, i=1, len=arguments.length; i<len; ++i) {
    x = arguments[i];
    for (name in x) { obj[name] = x[name]; }
  }
  return obj;
};

u.length = function(x) {
  return x != null && x.length != null ? x.length : null;
};

u.keys = function(x) {
  var keys = [], k;
  for (k in x) keys.push(k);
  return keys;
};

u.vals = function(x) {
  var vals = [], k;
  for (k in x) vals.push(x[k]);
  return vals;
};

u.toMap = function(list, f) {
  return (f = u.$(f)) ?
    list.reduce(function(obj, x) { return (obj[f(x)] = 1, obj); }, {}) :
    list.reduce(function(obj, x) { return (obj[x] = 1, obj); }, {});
};

u.keystr = function(values) {
  // use to ensure consistent key generation across modules
  var n = values.length;
  if (!n) return '';
  for (var s=String(values[0]), i=1; i<n; ++i) {
    s += '|' + String(values[i]);
  }
  return s;
};

// type checking functions

var toString = Object.prototype.toString;

u.isObject = function(obj) {
  return obj === Object(obj);
};

u.isFunction = function(obj) {
  return toString.call(obj) === '[object Function]';
};

u.isString = function(obj) {
  return typeof value === 'string' || toString.call(obj) === '[object String]';
};

u.isArray = Array.isArray || function(obj) {
  return toString.call(obj) === '[object Array]';
};

u.isNumber = function(obj) {
  return typeof obj === 'number' || toString.call(obj) === '[object Number]';
};

u.isBoolean = function(obj) {
  return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
};

u.isDate = function(obj) {
  return toString.call(obj) === '[object Date]';
};

u.isValid = function(obj) {
  return obj != null && obj === obj;
};

u.isBuffer = (typeof Buffer === 'function' && Buffer.isBuffer) || u.false;

// type coercion functions

u.number = function(s) {
  return s == null || s === '' ? null : +s;
};

u.boolean = function(s) {
  return s == null || s === '' ? null : s==='false' ? false : !!s;
};

// parse a date with optional d3.time-format format
u.date = function(s, format) {
  var d = format ? format : Date;
  return s == null || s === '' ? null : d.parse(s);
};

u.array = function(x) {
  return x != null ? (u.isArray(x) ? x : [x]) : [];
};

u.str = function(x) {
  return u.isArray(x) ? '[' + x.map(u.str) + ']'
    : u.isObject(x) || u.isString(x) ?
      // Output valid JSON and JS source strings.
      // See http://timelessrepo.com/json-isnt-a-javascript-subset
      JSON.stringify(x).replace('\u2028','\\u2028').replace('\u2029', '\\u2029')
    : x;
};

// data access functions

var field_re = /\[(.*?)\]|[^.\[]+/g;

u.field = function(f) {
  return String(f).match(field_re).map(function(d) {
    return d[0] !== '[' ? d :
      d[1] !== "'" && d[1] !== '"' ? d.slice(1, -1) :
      d.slice(2, -2).replace(/\\(["'])/g, '$1');
  });
};

u.accessor = function(f) {
  /* jshint evil: true */
  return f==null || u.isFunction(f) ? f :
    u.namedfunc(f, Function('x', 'return x[' + u.field(f).map(u.str).join('][') + '];'));
};

// short-cut for accessor
u.$ = u.accessor;

u.mutator = function(f) {
  var s;
  return u.isString(f) && (s=u.field(f)).length > 1 ?
    function(x, v) {
      for (var i=0; i<s.length-1; ++i) x = x[s[i]];
      x[s[i]] = v;
    } :
    function(x, v) { x[f] = v; };
};


u.$func = function(name, op) {
  return function(f) {
    f = u.$(f) || u.identity;
    var n = name + (u.name(f) ? '_'+u.name(f) : '');
    return u.namedfunc(n, function(d) { return op(f(d)); });
  };
};

u.$valid  = u.$func('valid', u.isValid);
u.$length = u.$func('length', u.length);

u.$in = function(f, values) {
  f = u.$(f);
  var map = u.isArray(values) ? u.toMap(values) : values;
  return function(d) { return !!map[f(d)]; };
};

// comparison / sorting functions

u.comparator = function(sort) {
  var sign = [];
  if (sort === undefined) sort = [];
  sort = u.array(sort).map(function(f) {
    var s = 1;
    if      (f[0] === '-') { s = -1; f = f.slice(1); }
    else if (f[0] === '+') { s = +1; f = f.slice(1); }
    sign.push(s);
    return u.accessor(f);
  });
  return function(a,b) {
    var i, n, f, x, y;
    for (i=0, n=sort.length; i<n; ++i) {
      f = sort[i]; x = f(a); y = f(b);
      if (x < y) return -1 * sign[i];
      if (x > y) return sign[i];
    }
    return 0;
  };
};

u.cmp = function(a, b) {
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  } else if (a >= b) {
    return 0;
  } else if (a === null) {
    return -1;
  } else if (b === null) {
    return 1;
  }
  return NaN;
};

u.numcmp = function(a, b) { return a - b; };

u.stablesort = function(array, sortBy, keyFn) {
  var indices = array.reduce(function(idx, v, i) {
    return (idx[keyFn(v)] = i, idx);
  }, {});

  array.sort(function(a, b) {
    var sa = sortBy(a),
        sb = sortBy(b);
    return sa < sb ? -1 : sa > sb ? 1
         : (indices[keyFn(a)] - indices[keyFn(b)]);
  });

  return array;
};


// string functions

u.pad = function(s, length, pos, padchar) {
  padchar = padchar || " ";
  var d = length - s.length;
  if (d <= 0) return s;
  switch (pos) {
    case 'left':
      return strrep(d, padchar) + s;
    case 'middle':
    case 'center':
      return strrep(Math.floor(d/2), padchar) +
         s + strrep(Math.ceil(d/2), padchar);
    default:
      return s + strrep(d, padchar);
  }
};

function strrep(n, str) {
  var s = "", i;
  for (i=0; i<n; ++i) s += str;
  return s;
}

u.truncate = function(s, length, pos, word, ellipsis) {
  var len = s.length;
  if (len <= length) return s;
  ellipsis = ellipsis !== undefined ? String(ellipsis) : '\u2026';
  var l = Math.max(0, length - ellipsis.length);

  switch (pos) {
    case 'left':
      return ellipsis + (word ? truncateOnWord(s,l,1) : s.slice(len-l));
    case 'middle':
    case 'center':
      var l1 = Math.ceil(l/2), l2 = Math.floor(l/2);
      return (word ? truncateOnWord(s,l1) : s.slice(0,l1)) +
        ellipsis + (word ? truncateOnWord(s,l2,1) : s.slice(len-l2));
    default:
      return (word ? truncateOnWord(s,l) : s.slice(0,l)) + ellipsis;
  }
};

function truncateOnWord(s, len, rev) {
  var cnt = 0, tok = s.split(truncate_word_re);
  if (rev) {
    s = (tok = tok.reverse())
      .filter(function(w) { cnt += w.length; return cnt <= len; })
      .reverse();
  } else {
    s = tok.filter(function(w) { cnt += w.length; return cnt <= len; });
  }
  return s.length ? s.join('').trim() : tok[0].slice(0, len);
}

var truncate_word_re = /([\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u2028\u2029\u3000\uFEFF])/;

}).call(this,require("buffer").Buffer)

},{"buffer":1}],7:[function(require,module,exports){
var json = typeof JSON !== 'undefined' ? JSON : require('jsonify');

module.exports = function (obj, opts) {
    if (!opts) opts = {};
    if (typeof opts === 'function') opts = { cmp: opts };
    var space = opts.space || '';
    if (typeof space === 'number') space = Array(space+1).join(' ');
    var cycles = (typeof opts.cycles === 'boolean') ? opts.cycles : false;
    var replacer = opts.replacer || function(key, value) { return value; };

    var cmp = opts.cmp && (function (f) {
        return function (node) {
            return function (a, b) {
                var aobj = { key: a, value: node[a] };
                var bobj = { key: b, value: node[b] };
                return f(aobj, bobj);
            };
        };
    })(opts.cmp);

    var seen = [];
    return (function stringify (parent, key, node, level) {
        var indent = space ? ('\n' + new Array(level + 1).join(space)) : '';
        var colonSeparator = space ? ': ' : ':';

        if (node && node.toJSON && typeof node.toJSON === 'function') {
            node = node.toJSON();
        }

        node = replacer.call(parent, key, node);

        if (node === undefined) {
            return;
        }
        if (typeof node !== 'object' || node === null) {
            return json.stringify(node);
        }
        if (isArray(node)) {
            var out = [];
            for (var i = 0; i < node.length; i++) {
                var item = stringify(node, i, node[i], level+1) || json.stringify(null);
                out.push(indent + space + item);
            }
            return '[' + out.join(',') + indent + ']';
        }
        else {
            if (seen.indexOf(node) !== -1) {
                if (cycles) return json.stringify('__cycle__');
                throw new TypeError('Converting circular structure to JSON');
            }
            else seen.push(node);

            var keys = objectKeys(node).sort(cmp && cmp(node));
            var out = [];
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var value = stringify(node, key, node[key], level+1);

                if(!value) continue;

                var keyValue = json.stringify(key)
                    + colonSeparator
                    + value;
                ;
                out.push(indent + space + keyValue);
            }
            seen.splice(seen.indexOf(node), 1);
            return '{' + out.join(',') + indent + '}';
        }
    })({ '': obj }, '', obj, 0);
};

var isArray = Array.isArray || function (x) {
    return {}.toString.call(x) === '[object Array]';
};

var objectKeys = Object.keys || function (obj) {
    var has = Object.prototype.hasOwnProperty || function () { return true };
    var keys = [];
    for (var key in obj) {
        if (has.call(obj, key)) keys.push(key);
    }
    return keys;
};

},{"jsonify":8}],8:[function(require,module,exports){
exports.parse = require('./lib/parse');
exports.stringify = require('./lib/stringify');

},{"./lib/parse":9,"./lib/stringify":10}],9:[function(require,module,exports){
var at, // The index of the current character
    ch, // The current character
    escapee = {
        '"':  '"',
        '\\': '\\',
        '/':  '/',
        b:    '\b',
        f:    '\f',
        n:    '\n',
        r:    '\r',
        t:    '\t'
    },
    text,

    error = function (m) {
        // Call error when something is wrong.
        throw {
            name:    'SyntaxError',
            message: m,
            at:      at,
            text:    text
        };
    },
    
    next = function (c) {
        // If a c parameter is provided, verify that it matches the current character.
        if (c && c !== ch) {
            error("Expected '" + c + "' instead of '" + ch + "'");
        }
        
        // Get the next character. When there are no more characters,
        // return the empty string.
        
        ch = text.charAt(at);
        at += 1;
        return ch;
    },
    
    number = function () {
        // Parse a number value.
        var number,
            string = '';
        
        if (ch === '-') {
            string = '-';
            next('-');
        }
        while (ch >= '0' && ch <= '9') {
            string += ch;
            next();
        }
        if (ch === '.') {
            string += '.';
            while (next() && ch >= '0' && ch <= '9') {
                string += ch;
            }
        }
        if (ch === 'e' || ch === 'E') {
            string += ch;
            next();
            if (ch === '-' || ch === '+') {
                string += ch;
                next();
            }
            while (ch >= '0' && ch <= '9') {
                string += ch;
                next();
            }
        }
        number = +string;
        if (!isFinite(number)) {
            error("Bad number");
        } else {
            return number;
        }
    },
    
    string = function () {
        // Parse a string value.
        var hex,
            i,
            string = '',
            uffff;
        
        // When parsing for string values, we must look for " and \ characters.
        if (ch === '"') {
            while (next()) {
                if (ch === '"') {
                    next();
                    return string;
                } else if (ch === '\\') {
                    next();
                    if (ch === 'u') {
                        uffff = 0;
                        for (i = 0; i < 4; i += 1) {
                            hex = parseInt(next(), 16);
                            if (!isFinite(hex)) {
                                break;
                            }
                            uffff = uffff * 16 + hex;
                        }
                        string += String.fromCharCode(uffff);
                    } else if (typeof escapee[ch] === 'string') {
                        string += escapee[ch];
                    } else {
                        break;
                    }
                } else {
                    string += ch;
                }
            }
        }
        error("Bad string");
    },

    white = function () {

// Skip whitespace.

        while (ch && ch <= ' ') {
            next();
        }
    },

    word = function () {

// true, false, or null.

        switch (ch) {
        case 't':
            next('t');
            next('r');
            next('u');
            next('e');
            return true;
        case 'f':
            next('f');
            next('a');
            next('l');
            next('s');
            next('e');
            return false;
        case 'n':
            next('n');
            next('u');
            next('l');
            next('l');
            return null;
        }
        error("Unexpected '" + ch + "'");
    },

    value,  // Place holder for the value function.

    array = function () {

// Parse an array value.

        var array = [];

        if (ch === '[') {
            next('[');
            white();
            if (ch === ']') {
                next(']');
                return array;   // empty array
            }
            while (ch) {
                array.push(value());
                white();
                if (ch === ']') {
                    next(']');
                    return array;
                }
                next(',');
                white();
            }
        }
        error("Bad array");
    },

    object = function () {

// Parse an object value.

        var key,
            object = {};

        if (ch === '{') {
            next('{');
            white();
            if (ch === '}') {
                next('}');
                return object;   // empty object
            }
            while (ch) {
                key = string();
                white();
                next(':');
                if (Object.hasOwnProperty.call(object, key)) {
                    error('Duplicate key "' + key + '"');
                }
                object[key] = value();
                white();
                if (ch === '}') {
                    next('}');
                    return object;
                }
                next(',');
                white();
            }
        }
        error("Bad object");
    };

value = function () {

// Parse a JSON value. It could be an object, an array, a string, a number,
// or a word.

    white();
    switch (ch) {
    case '{':
        return object();
    case '[':
        return array();
    case '"':
        return string();
    case '-':
        return number();
    default:
        return ch >= '0' && ch <= '9' ? number() : word();
    }
};

// Return the json_parse function. It will have access to all of the above
// functions and variables.

module.exports = function (source, reviver) {
    var result;
    
    text = source;
    at = 0;
    ch = ' ';
    result = value();
    white();
    if (ch) {
        error("Syntax error");
    }

    // If there is a reviver function, we recursively walk the new structure,
    // passing each name/value pair to the reviver function for possible
    // transformation, starting with a temporary root object that holds the result
    // in an empty key. If there is not a reviver function, we simply return the
    // result.

    return typeof reviver === 'function' ? (function walk(holder, key) {
        var k, v, value = holder[key];
        if (value && typeof value === 'object') {
            for (k in value) {
                if (Object.prototype.hasOwnProperty.call(value, k)) {
                    v = walk(value, k);
                    if (v !== undefined) {
                        value[k] = v;
                    } else {
                        delete value[k];
                    }
                }
            }
        }
        return reviver.call(holder, key, value);
    }({'': result}, '')) : result;
};

},{}],10:[function(require,module,exports){
var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    gap,
    indent,
    meta = {    // table of character substitutions
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
    },
    rep;

function quote(string) {
    // If the string contains no control characters, no quote characters, and no
    // backslash characters, then we can safely slap some quotes around it.
    // Otherwise we must also replace the offending characters with safe escape
    // sequences.
    
    escapable.lastIndex = 0;
    return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
        var c = meta[a];
        return typeof c === 'string' ? c :
            '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
    }) + '"' : '"' + string + '"';
}

function str(key, holder) {
    // Produce a string from holder[key].
    var i,          // The loop counter.
        k,          // The member key.
        v,          // The member value.
        length,
        mind = gap,
        partial,
        value = holder[key];
    
    // If the value has a toJSON method, call it to obtain a replacement value.
    if (value && typeof value === 'object' &&
            typeof value.toJSON === 'function') {
        value = value.toJSON(key);
    }
    
    // If we were called with a replacer function, then call the replacer to
    // obtain a replacement value.
    if (typeof rep === 'function') {
        value = rep.call(holder, key, value);
    }
    
    // What happens next depends on the value's type.
    switch (typeof value) {
        case 'string':
            return quote(value);
        
        case 'number':
            // JSON numbers must be finite. Encode non-finite numbers as null.
            return isFinite(value) ? String(value) : 'null';
        
        case 'boolean':
        case 'null':
            // If the value is a boolean or null, convert it to a string. Note:
            // typeof null does not produce 'null'. The case is included here in
            // the remote chance that this gets fixed someday.
            return String(value);
            
        case 'object':
            if (!value) return 'null';
            gap += indent;
            partial = [];
            
            // Array.isArray
            if (Object.prototype.toString.apply(value) === '[object Array]') {
                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }
                
                // Join all of the elements together, separated with commas, and
                // wrap them in brackets.
                v = partial.length === 0 ? '[]' : gap ?
                    '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                    '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }
            
            // If the replacer is an array, use it to select the members to be
            // stringified.
            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }
            else {
                // Otherwise, iterate through all of the keys in the object.
                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }
            
        // Join all of the member texts together, separated with commas,
        // and wrap them in braces.

        v = partial.length === 0 ? '{}' : gap ?
            '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
            '{' + partial.join(',') + '}';
        gap = mind;
        return v;
    }
}

module.exports = function (value, replacer, space) {
    var i;
    gap = '';
    indent = '';
    
    // If the space parameter is a number, make an indent string containing that
    // many spaces.
    if (typeof space === 'number') {
        for (i = 0; i < space; i += 1) {
            indent += ' ';
        }
    }
    // If the space parameter is a string, it will be used as the indent string.
    else if (typeof space === 'string') {
        indent = space;
    }

    // If there is a replacer, it must be a function or an array.
    // Otherwise, throw an error.
    rep = replacer;
    if (replacer && typeof replacer !== 'function'
    && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
        throw new Error('JSON.stringify');
    }
    
    // Make a fake root object containing our value under the key of ''.
    // Return the result of stringifying the value.
    return str('', {'': value});
};

},{}],11:[function(require,module,exports){
"use strict";
(function (AggregateOp) {
    AggregateOp[AggregateOp["VALUES"] = 'values'] = "VALUES";
    AggregateOp[AggregateOp["COUNT"] = 'count'] = "COUNT";
    AggregateOp[AggregateOp["VALID"] = 'valid'] = "VALID";
    AggregateOp[AggregateOp["MISSING"] = 'missing'] = "MISSING";
    AggregateOp[AggregateOp["DISTINCT"] = 'distinct'] = "DISTINCT";
    AggregateOp[AggregateOp["SUM"] = 'sum'] = "SUM";
    AggregateOp[AggregateOp["MEAN"] = 'mean'] = "MEAN";
    AggregateOp[AggregateOp["AVERAGE"] = 'average'] = "AVERAGE";
    AggregateOp[AggregateOp["VARIANCE"] = 'variance'] = "VARIANCE";
    AggregateOp[AggregateOp["VARIANCEP"] = 'variancep'] = "VARIANCEP";
    AggregateOp[AggregateOp["STDEV"] = 'stdev'] = "STDEV";
    AggregateOp[AggregateOp["STDEVP"] = 'stdevp'] = "STDEVP";
    AggregateOp[AggregateOp["MEDIAN"] = 'median'] = "MEDIAN";
    AggregateOp[AggregateOp["Q1"] = 'q1'] = "Q1";
    AggregateOp[AggregateOp["Q3"] = 'q3'] = "Q3";
    AggregateOp[AggregateOp["MODESKEW"] = 'modeskew'] = "MODESKEW";
    AggregateOp[AggregateOp["MIN"] = 'min'] = "MIN";
    AggregateOp[AggregateOp["MAX"] = 'max'] = "MAX";
    AggregateOp[AggregateOp["ARGMIN"] = 'argmin'] = "ARGMIN";
    AggregateOp[AggregateOp["ARGMAX"] = 'argmax'] = "ARGMAX";
    AggregateOp[AggregateOp["BOXMINMAX"] = 'boxMinMax'] = "BOXMINMAX";
})(exports.AggregateOp || (exports.AggregateOp = {}));
var AggregateOp = exports.AggregateOp;
exports.AGGREGATE_OPS = [
    AggregateOp.VALUES,
    AggregateOp.COUNT,
    AggregateOp.VALID,
    AggregateOp.MISSING,
    AggregateOp.DISTINCT,
    AggregateOp.SUM,
    AggregateOp.MEAN,
    AggregateOp.AVERAGE,
    AggregateOp.VARIANCE,
    AggregateOp.VARIANCEP,
    AggregateOp.STDEV,
    AggregateOp.STDEVP,
    AggregateOp.MEDIAN,
    AggregateOp.Q1,
    AggregateOp.Q3,
    AggregateOp.MODESKEW,
    AggregateOp.MIN,
    AggregateOp.MAX,
    AggregateOp.ARGMIN,
    AggregateOp.ARGMAX,
    AggregateOp.BOXMINMAX
];
exports.SHARED_DOMAIN_OPS = [
    AggregateOp.MEAN,
    AggregateOp.AVERAGE,
    AggregateOp.STDEV,
    AggregateOp.STDEVP,
    AggregateOp.MEDIAN,
    AggregateOp.Q1,
    AggregateOp.Q3,
    AggregateOp.MIN,
    AggregateOp.MAX,
];

},{}],12:[function(require,module,exports){
"use strict";
(function (AxisOrient) {
    AxisOrient[AxisOrient["TOP"] = 'top'] = "TOP";
    AxisOrient[AxisOrient["RIGHT"] = 'right'] = "RIGHT";
    AxisOrient[AxisOrient["LEFT"] = 'left'] = "LEFT";
    AxisOrient[AxisOrient["BOTTOM"] = 'bottom'] = "BOTTOM";
})(exports.AxisOrient || (exports.AxisOrient = {}));
var AxisOrient = exports.AxisOrient;
exports.defaultAxisConfig = {
    offset: undefined,
    grid: undefined,
    labels: true,
    labelMaxLength: 25,
    tickSize: undefined,
    characterWidth: 6
};
exports.defaultFacetAxisConfig = {
    axisWidth: 0,
    labels: true,
    grid: false,
    tickSize: 0
};

},{}],13:[function(require,module,exports){
"use strict";
var channel_1 = require('./channel');
function autoMaxBins(channel) {
    switch (channel) {
        case channel_1.ROW:
        case channel_1.COLUMN:
        case channel_1.SIZE:
        case channel_1.SHAPE:
            return 6;
        default:
            return 10;
    }
}
exports.autoMaxBins = autoMaxBins;

},{"./channel":14}],14:[function(require,module,exports){
"use strict";
var util_1 = require('./util');
(function (Channel) {
    Channel[Channel["X"] = 'x'] = "X";
    Channel[Channel["Y"] = 'y'] = "Y";
    Channel[Channel["X2"] = 'x2'] = "X2";
    Channel[Channel["Y2"] = 'y2'] = "Y2";
    Channel[Channel["ROW"] = 'row'] = "ROW";
    Channel[Channel["COLUMN"] = 'column'] = "COLUMN";
    Channel[Channel["SHAPE"] = 'shape'] = "SHAPE";
    Channel[Channel["SIZE"] = 'size'] = "SIZE";
    Channel[Channel["COLOR"] = 'color'] = "COLOR";
    Channel[Channel["TEXT"] = 'text'] = "TEXT";
    Channel[Channel["DETAIL"] = 'detail'] = "DETAIL";
    Channel[Channel["LABEL"] = 'label'] = "LABEL";
    Channel[Channel["PATH"] = 'path'] = "PATH";
    Channel[Channel["ORDER"] = 'order'] = "ORDER";
    Channel[Channel["OPACITY"] = 'opacity'] = "OPACITY";
})(exports.Channel || (exports.Channel = {}));
var Channel = exports.Channel;
exports.X = Channel.X;
exports.Y = Channel.Y;
exports.X2 = Channel.X2;
exports.Y2 = Channel.Y2;
exports.ROW = Channel.ROW;
exports.COLUMN = Channel.COLUMN;
exports.SHAPE = Channel.SHAPE;
exports.SIZE = Channel.SIZE;
exports.COLOR = Channel.COLOR;
exports.TEXT = Channel.TEXT;
exports.DETAIL = Channel.DETAIL;
exports.LABEL = Channel.LABEL;
exports.PATH = Channel.PATH;
exports.ORDER = Channel.ORDER;
exports.OPACITY = Channel.OPACITY;
exports.CHANNELS = [exports.X, exports.Y, exports.X2, exports.Y2, exports.ROW, exports.COLUMN, exports.SIZE, exports.SHAPE, exports.COLOR, exports.PATH, exports.ORDER, exports.OPACITY, exports.TEXT, exports.DETAIL, exports.LABEL];
exports.UNIT_CHANNELS = util_1.without(exports.CHANNELS, [exports.ROW, exports.COLUMN]);
exports.UNIT_SCALE_CHANNELS = util_1.without(exports.UNIT_CHANNELS, [exports.PATH, exports.ORDER, exports.DETAIL, exports.TEXT, exports.LABEL, exports.X2, exports.Y2]);
exports.NONSPATIAL_CHANNELS = util_1.without(exports.UNIT_CHANNELS, [exports.X, exports.Y, exports.X2, exports.Y2]);
exports.NONSPATIAL_SCALE_CHANNELS = util_1.without(exports.UNIT_SCALE_CHANNELS, [exports.X, exports.Y, exports.X2, exports.Y2]);
;
function supportMark(channel, mark) {
    return !!getSupportedMark(channel)[mark];
}
exports.supportMark = supportMark;
function getSupportedMark(channel) {
    switch (channel) {
        case exports.X:
        case exports.Y:
        case exports.COLOR:
        case exports.DETAIL:
        case exports.ORDER:
        case exports.OPACITY:
        case exports.ROW:
        case exports.COLUMN:
            return {
                point: true, tick: true, rule: true, circle: true, square: true,
                bar: true, line: true, area: true, text: true
            };
        case exports.X2:
        case exports.Y2:
            return {
                rule: true, bar: true, area: true
            };
        case exports.SIZE:
            return {
                point: true, tick: true, rule: true, circle: true, square: true,
                bar: true, text: true
            };
        case exports.SHAPE:
            return { point: true };
        case exports.TEXT:
            return { text: true };
        case exports.PATH:
            return { line: true };
    }
    return {};
}
exports.getSupportedMark = getSupportedMark;
;
function getSupportedRole(channel) {
    switch (channel) {
        case exports.X:
        case exports.Y:
        case exports.COLOR:
        case exports.OPACITY:
        case exports.LABEL:
            return {
                measure: true,
                dimension: true
            };
        case exports.ROW:
        case exports.COLUMN:
        case exports.SHAPE:
        case exports.DETAIL:
            return {
                measure: false,
                dimension: true
            };
        case exports.X2:
        case exports.Y2:
        case exports.SIZE:
        case exports.TEXT:
            return {
                measure: true,
                dimension: false
            };
        case exports.PATH:
            return {
                measure: false,
                dimension: true
            };
    }
    throw new Error('Invalid encoding channel' + channel);
}
exports.getSupportedRole = getSupportedRole;
function hasScale(channel) {
    return !util_1.contains([exports.DETAIL, exports.PATH, exports.TEXT, exports.LABEL, exports.ORDER], channel);
}
exports.hasScale = hasScale;

},{"./util":61}],15:[function(require,module,exports){
"use strict";
var axis_1 = require('../axis');
var channel_1 = require('../channel');
var fielddef_1 = require('../fielddef');
var type_1 = require('../type');
var util_1 = require('../util');
var common_1 = require('./common');
function parseAxisComponent(model, axisChannels) {
    return axisChannels.reduce(function (axis, channel) {
        if (model.axis(channel)) {
            axis[channel] = parseAxis(channel, model);
        }
        return axis;
    }, {});
}
exports.parseAxisComponent = parseAxisComponent;
function parseInnerAxis(channel, model) {
    var isCol = channel === channel_1.COLUMN, isRow = channel === channel_1.ROW, type = isCol ? 'x' : isRow ? 'y' : channel;
    var def = {
        type: type,
        scale: model.scaleName(channel),
        grid: true,
        tickSize: 0,
        properties: {
            labels: {
                text: { value: '' }
            },
            axis: {
                stroke: { value: 'transparent' }
            }
        }
    };
    var axis = model.axis(channel);
    ['layer', 'ticks', 'values', 'subdivide'].forEach(function (property) {
        var method;
        var value = (method = exports[property]) ?
            method(model, channel, def) :
            axis[property];
        if (value !== undefined) {
            def[property] = value;
        }
    });
    var props = model.axis(channel).properties || {};
    ['grid'].forEach(function (group) {
        var value = properties[group] ?
            properties[group](model, channel, props[group] || {}, def) :
            props[group];
        if (value !== undefined && util_1.keys(value).length > 0) {
            def.properties = def.properties || {};
            def.properties[group] = value;
        }
    });
    return def;
}
exports.parseInnerAxis = parseInnerAxis;
function parseAxis(channel, model) {
    var isCol = channel === channel_1.COLUMN, isRow = channel === channel_1.ROW, type = isCol ? 'x' : isRow ? 'y' : channel;
    var axis = model.axis(channel);
    var def = {
        type: type,
        scale: model.scaleName(channel)
    };
    var targetChannel = channel;
    if (!model.has(channel)) {
        targetChannel = channel === channel_1.X ? channel_1.X2 : channel_1.Y2;
    }
    util_1.extend(def, common_1.formatMixins(model, model.fieldDef(targetChannel), axis.format, axis.shortTimeLabels));
    [
        'grid', 'layer', 'offset', 'orient', 'tickSize', 'ticks', 'tickSizeEnd', 'title', 'titleOffset',
        'tickPadding', 'tickSize', 'tickSizeMajor', 'tickSizeMinor', 'values', 'subdivide'
    ].forEach(function (property) {
        var method;
        var value = (method = exports[property]) ?
            method(model, channel, def) :
            axis[property];
        if (value !== undefined) {
            def[property] = value;
        }
    });
    var props = model.axis(channel).properties || {};
    [
        'axis', 'labels',
        'grid', 'title', 'ticks', 'majorTicks', 'minorTicks'
    ].forEach(function (group) {
        var value = properties[group] ?
            properties[group](model, channel, props[group] || {}, def) :
            props[group];
        if (value !== undefined && util_1.keys(value).length > 0) {
            def.properties = def.properties || {};
            def.properties[group] = value;
        }
    });
    return def;
}
exports.parseAxis = parseAxis;
function offset(model, channel) {
    return model.axis(channel).offset;
}
exports.offset = offset;
function gridShow(model, channel) {
    var grid = model.axis(channel).grid;
    if (grid !== undefined) {
        return grid;
    }
    return !model.isOrdinalScale(channel) && !model.fieldDef(channel).bin;
}
exports.gridShow = gridShow;
function grid(model, channel) {
    if (channel === channel_1.ROW || channel === channel_1.COLUMN) {
        return undefined;
    }
    return gridShow(model, channel) && ((channel === channel_1.Y || channel === channel_1.X) && !(model.parent() && model.parent().isFacet()));
}
exports.grid = grid;
function layer(model, channel, def) {
    var layer = model.axis(channel).layer;
    if (layer !== undefined) {
        return layer;
    }
    if (def.grid) {
        return 'back';
    }
    return undefined;
}
exports.layer = layer;
;
function orient(model, channel) {
    var orient = model.axis(channel).orient;
    if (orient) {
        return orient;
    }
    else if (channel === channel_1.COLUMN) {
        return axis_1.AxisOrient.TOP;
    }
    return undefined;
}
exports.orient = orient;
function ticks(model, channel) {
    var ticks = model.axis(channel).ticks;
    if (ticks !== undefined) {
        return ticks;
    }
    if (channel === channel_1.X && !model.fieldDef(channel).bin) {
        return 5;
    }
    return undefined;
}
exports.ticks = ticks;
function tickSize(model, channel) {
    var tickSize = model.axis(channel).tickSize;
    if (tickSize !== undefined) {
        return tickSize;
    }
    return undefined;
}
exports.tickSize = tickSize;
function tickSizeEnd(model, channel) {
    var tickSizeEnd = model.axis(channel).tickSizeEnd;
    if (tickSizeEnd !== undefined) {
        return tickSizeEnd;
    }
    return undefined;
}
exports.tickSizeEnd = tickSizeEnd;
function title(model, channel) {
    var axis = model.axis(channel);
    if (axis.title !== undefined) {
        return axis.title;
    }
    var fieldTitle = fielddef_1.title(model.fieldDef(channel));
    var maxLength;
    if (axis.titleMaxLength) {
        maxLength = axis.titleMaxLength;
    }
    else if (channel === channel_1.X && !model.isOrdinalScale(channel_1.X)) {
        var unitModel = model;
        maxLength = unitModel.config().cell.width / model.axis(channel_1.X).characterWidth;
    }
    else if (channel === channel_1.Y && !model.isOrdinalScale(channel_1.Y)) {
        var unitModel = model;
        maxLength = unitModel.config().cell.height / model.axis(channel_1.Y).characterWidth;
    }
    return maxLength ? util_1.truncate(fieldTitle, maxLength) : fieldTitle;
}
exports.title = title;
function titleOffset(model, channel) {
    var titleOffset = model.axis(channel).titleOffset;
    if (titleOffset !== undefined) {
        return titleOffset;
    }
    return undefined;
}
exports.titleOffset = titleOffset;
var properties;
(function (properties) {
    function axis(model, channel, axisPropsSpec) {
        var axis = model.axis(channel);
        return util_1.extend(axis.axisColor !== undefined ?
            { stroke: { value: axis.axisColor } } :
            {}, axis.axisWidth !== undefined ?
            { strokeWidth: { value: axis.axisWidth } } :
            {}, axisPropsSpec || {});
    }
    properties.axis = axis;
    function grid(model, channel, gridPropsSpec) {
        var axis = model.axis(channel);
        return util_1.extend(axis.gridColor !== undefined ? { stroke: { value: axis.gridColor } } : {}, axis.gridOpacity !== undefined ? { strokeOpacity: { value: axis.gridOpacity } } : {}, axis.gridWidth !== undefined ? { strokeWidth: { value: axis.gridWidth } } : {}, axis.gridDash !== undefined ? { strokeDashOffset: { value: axis.gridDash } } : {}, gridPropsSpec || {});
    }
    properties.grid = grid;
    function labels(model, channel, labelsSpec, def) {
        var fieldDef = model.fieldDef(channel);
        var axis = model.axis(channel);
        if (!axis.labels) {
            return util_1.extend({
                text: ''
            }, labelsSpec);
        }
        if (util_1.contains([type_1.NOMINAL, type_1.ORDINAL], fieldDef.type) && axis.labelMaxLength) {
            labelsSpec = util_1.extend({
                text: {
                    template: '{{ datum.data | truncate:' + axis.labelMaxLength + '}}'
                }
            }, labelsSpec || {});
        }
        if (axis.labelAngle !== undefined) {
            labelsSpec.angle = { value: axis.labelAngle };
        }
        else {
            if (channel === channel_1.X && (fielddef_1.isDimension(fieldDef) || fieldDef.type === type_1.TEMPORAL)) {
                labelsSpec.angle = { value: 270 };
            }
        }
        if (axis.labelAlign !== undefined) {
            labelsSpec.align = { value: axis.labelAlign };
        }
        else {
            if (labelsSpec.angle) {
                if (labelsSpec.angle.value === 270) {
                    labelsSpec.align = {
                        value: def.orient === 'top' ? 'left' :
                            def.type === 'x' ? 'right' :
                                'center'
                    };
                }
                else if (labelsSpec.angle.value === 90) {
                    labelsSpec.align = { value: 'center' };
                }
            }
        }
        if (axis.labelBaseline !== undefined) {
            labelsSpec.baseline = { value: axis.labelBaseline };
        }
        else {
            if (labelsSpec.angle) {
                if (labelsSpec.angle.value === 270) {
                    labelsSpec.baseline = { value: def.type === 'x' ? 'middle' : 'bottom' };
                }
                else if (labelsSpec.angle.value === 90) {
                    labelsSpec.baseline = { value: 'bottom' };
                }
            }
        }
        if (axis.tickLabelColor !== undefined) {
            labelsSpec.stroke = { value: axis.tickLabelColor };
        }
        if (axis.tickLabelFont !== undefined) {
            labelsSpec.font = { value: axis.tickLabelFont };
        }
        if (axis.tickLabelFontSize !== undefined) {
            labelsSpec.fontSize = { value: axis.tickLabelFontSize };
        }
        return util_1.keys(labelsSpec).length === 0 ? undefined : labelsSpec;
    }
    properties.labels = labels;
    function ticks(model, channel, ticksPropsSpec) {
        var axis = model.axis(channel);
        return util_1.extend(axis.tickColor !== undefined ? { stroke: { value: axis.tickColor } } : {}, axis.tickWidth !== undefined ? { strokeWidth: { value: axis.tickWidth } } : {}, ticksPropsSpec || {});
    }
    properties.ticks = ticks;
    function title(model, channel, titlePropsSpec) {
        var axis = model.axis(channel);
        return util_1.extend(axis.titleColor !== undefined ? { stroke: { value: axis.titleColor } } : {}, axis.titleFont !== undefined ? { font: { value: axis.titleFont } } : {}, axis.titleFontSize !== undefined ? { fontSize: { value: axis.titleFontSize } } : {}, axis.titleFontWeight !== undefined ? { fontWeight: { value: axis.titleFontWeight } } : {}, titlePropsSpec || {});
    }
    properties.title = title;
})(properties = exports.properties || (exports.properties = {}));

},{"../axis":12,"../channel":14,"../fielddef":52,"../type":60,"../util":61,"./common":16}],16:[function(require,module,exports){
"use strict";
var channel_1 = require('../channel');
var fielddef_1 = require('../fielddef');
var sort_1 = require('../sort');
var type_1 = require('../type');
var util_1 = require('../util');
var facet_1 = require('./facet');
var layer_1 = require('./layer');
var timeunit_1 = require('../timeunit');
var unit_1 = require('./unit');
var spec_1 = require('../spec');
function buildModel(spec, parent, parentGivenName) {
    if (spec_1.isFacetSpec(spec)) {
        return new facet_1.FacetModel(spec, parent, parentGivenName);
    }
    if (spec_1.isLayerSpec(spec)) {
        return new layer_1.LayerModel(spec, parent, parentGivenName);
    }
    if (spec_1.isUnitSpec(spec)) {
        return new unit_1.UnitModel(spec, parent, parentGivenName);
    }
    console.error('Invalid spec.');
    return null;
}
exports.buildModel = buildModel;
exports.STROKE_CONFIG = ['stroke', 'strokeWidth',
    'strokeDash', 'strokeDashOffset', 'strokeOpacity', 'opacity'];
exports.FILL_CONFIG = ['fill', 'fillOpacity',
    'opacity'];
exports.FILL_STROKE_CONFIG = util_1.union(exports.STROKE_CONFIG, exports.FILL_CONFIG);
function applyColorAndOpacity(p, model) {
    var filled = model.config().mark.filled;
    var colorFieldDef = model.fieldDef(channel_1.COLOR);
    var opacityFieldDef = model.fieldDef(channel_1.OPACITY);
    if (filled) {
        applyMarkConfig(p, model, exports.FILL_CONFIG);
    }
    else {
        applyMarkConfig(p, model, exports.STROKE_CONFIG);
    }
    var colorValue;
    var opacityValue;
    if (model.has(channel_1.COLOR)) {
        colorValue = {
            scale: model.scaleName(channel_1.COLOR),
            field: model.field(channel_1.COLOR, colorFieldDef.type === type_1.ORDINAL ? { prefn: 'rank_' } : {})
        };
    }
    else if (colorFieldDef && colorFieldDef.value) {
        colorValue = { value: colorFieldDef.value };
    }
    if (model.has(channel_1.OPACITY)) {
        opacityValue = {
            scale: model.scaleName(channel_1.OPACITY),
            field: model.field(channel_1.OPACITY, opacityFieldDef.type === type_1.ORDINAL ? { prefn: 'rank_' } : {})
        };
    }
    else if (opacityFieldDef && opacityFieldDef.value) {
        opacityValue = { value: opacityFieldDef.value };
    }
    if (colorValue !== undefined) {
        if (filled) {
            p.fill = colorValue;
        }
        else {
            p.stroke = colorValue;
        }
    }
    else {
        p[filled ? 'fill' : 'stroke'] = p[filled ? 'fill' : 'stroke'] ||
            { value: model.config().mark.color };
    }
    if (opacityValue !== undefined) {
        p.opacity = opacityValue;
    }
}
exports.applyColorAndOpacity = applyColorAndOpacity;
function applyConfig(properties, config, propsList) {
    propsList.forEach(function (property) {
        var value = config[property];
        if (value !== undefined) {
            properties[property] = { value: value };
        }
    });
    return properties;
}
exports.applyConfig = applyConfig;
function applyMarkConfig(marksProperties, model, propsList) {
    return applyConfig(marksProperties, model.config().mark, propsList);
}
exports.applyMarkConfig = applyMarkConfig;
function formatMixins(model, fieldDef, format, shortTimeLabels) {
    if (!util_1.contains([type_1.QUANTITATIVE, type_1.TEMPORAL], fieldDef.type)) {
        return {};
    }
    var def = {};
    if (fieldDef.type === type_1.TEMPORAL) {
        def.formatType = 'time';
    }
    if (format !== undefined) {
        def.format = format;
    }
    else {
        switch (fieldDef.type) {
            case type_1.QUANTITATIVE:
                def.format = model.config().numberFormat;
                break;
            case type_1.TEMPORAL:
                def.format = timeunit_1.format(fieldDef.timeUnit, shortTimeLabels) || model.config().timeFormat;
                break;
        }
    }
    return def;
}
exports.formatMixins = formatMixins;
function sortField(orderChannelDef) {
    return (orderChannelDef.sort === sort_1.SortOrder.DESCENDING ? '-' : '') + fielddef_1.field(orderChannelDef);
}
exports.sortField = sortField;

},{"../channel":14,"../fielddef":52,"../sort":57,"../spec":58,"../timeunit":59,"../type":60,"../util":61,"./facet":32,"./layer":33,"./unit":48}],17:[function(require,module,exports){
"use strict";
var data_1 = require('../data');
var spec_1 = require('../spec');
var util_1 = require('../util');
var common_1 = require('./common');
function compile(inputSpec) {
    var spec = spec_1.normalize(inputSpec);
    var model = common_1.buildModel(spec, null, '');
    model.parse();
    return assemble(model);
}
exports.compile = compile;
function assemble(model) {
    var config = model.config();
    var output = util_1.extend({
        width: 1,
        height: 1,
        padding: 'auto'
    }, config.viewport ? { viewport: config.viewport } : {}, config.background ? { background: config.background } : {}, {
        data: [].concat(model.assembleData([]), model.assembleLayout([])),
        marks: [assembleRootGroup(model)]
    });
    return {
        spec: output
    };
}
function assembleRootGroup(model) {
    var rootGroup = util_1.extend({
        name: model.name('root'),
        type: 'group',
    }, model.description() ? { description: model.description() } : {}, {
        from: { data: data_1.LAYOUT },
        properties: {
            update: util_1.extend({
                width: { field: 'width' },
                height: { field: 'height' }
            }, model.assembleParentGroupProperties(model.config().cell))
        }
    });
    return util_1.extend(rootGroup, model.assembleGroup());
}
exports.assembleRootGroup = assembleRootGroup;

},{"../data":50,"../spec":58,"../util":61,"./common":16}],18:[function(require,module,exports){
"use strict";
var channel_1 = require('../channel');
var encoding_1 = require('../encoding');
var fielddef_1 = require('../fielddef');
var mark_1 = require('../mark');
var util_1 = require('../util');
function initMarkConfig(mark, encoding, config) {
    return util_1.extend(['filled', 'opacity', 'orient', 'align'].reduce(function (cfg, property) {
        var value = config.mark[property];
        switch (property) {
            case 'filled':
                if (value === undefined) {
                    cfg[property] = mark !== mark_1.POINT && mark !== mark_1.LINE && mark !== mark_1.RULE;
                }
                break;
            case 'opacity':
                if (value === undefined && util_1.contains([mark_1.POINT, mark_1.TICK, mark_1.CIRCLE, mark_1.SQUARE], mark)) {
                    if (!encoding_1.isAggregate(encoding) || encoding_1.has(encoding, channel_1.DETAIL)) {
                        cfg[property] = 0.7;
                    }
                }
                break;
            case 'orient':
                var xIsMeasure = fielddef_1.isMeasure(encoding.x) || fielddef_1.isMeasure(encoding.x2);
                var yIsMeasure = fielddef_1.isMeasure(encoding.y) || fielddef_1.isMeasure(encoding.y2);
                if (xIsMeasure && !yIsMeasure) {
                    if (mark === mark_1.TICK) {
                        cfg[property] = 'vertical';
                    }
                    else {
                        cfg[property] = 'horizontal';
                    }
                }
                else if (!xIsMeasure && yIsMeasure) {
                    if (mark === mark_1.TICK) {
                        cfg[property] = 'horizontal';
                    }
                    else {
                        cfg[property] = 'vertical';
                    }
                }
                break;
            case 'align':
                if (value === undefined) {
                    cfg[property] = encoding_1.has(encoding, channel_1.X) ? 'center' : 'right';
                }
        }
        return cfg;
    }, {}), config.mark);
}
exports.initMarkConfig = initMarkConfig;

},{"../channel":14,"../encoding":51,"../fielddef":52,"../mark":54,"../util":61}],19:[function(require,module,exports){
"use strict";
var bin_1 = require('../../bin');
var channel_1 = require('../../channel');
var fielddef_1 = require('../../fielddef');
var util_1 = require('../../util');
var bin;
(function (bin_2) {
    function parse(model) {
        return model.reduce(function (binComponent, fieldDef, channel) {
            var bin = model.fieldDef(channel).bin;
            if (bin) {
                var binTrans = util_1.extend({
                    type: 'bin',
                    field: fieldDef.field,
                    output: {
                        start: fielddef_1.field(fieldDef, { binSuffix: '_start' }),
                        mid: fielddef_1.field(fieldDef, { binSuffix: '_mid' }),
                        end: fielddef_1.field(fieldDef, { binSuffix: '_end' })
                    }
                }, typeof bin === 'boolean' ? {} : bin);
                if (!binTrans.maxbins && !binTrans.step) {
                    binTrans.maxbins = bin_1.autoMaxBins(channel);
                }
                var transform = [binTrans];
                var isOrdinalColor = model.isOrdinalScale(channel) || channel === channel_1.COLOR;
                if (isOrdinalColor) {
                    transform.push({
                        type: 'formula',
                        field: fielddef_1.field(fieldDef, { binSuffix: '_range' }),
                        expr: fielddef_1.field(fieldDef, { datum: true, binSuffix: '_start' }) +
                            ' + \'-\' + ' +
                            fielddef_1.field(fieldDef, { datum: true, binSuffix: '_end' })
                    });
                }
                var key = util_1.hash(bin) + '_' + fieldDef.field + 'oc:' + isOrdinalColor;
                binComponent[key] = transform;
            }
            return binComponent;
        }, {});
    }
    bin_2.parseUnit = parse;
    function parseFacet(model) {
        var binComponent = parse(model);
        var childDataComponent = model.child().component.data;
        if (!childDataComponent.source) {
            util_1.extend(binComponent, childDataComponent.bin);
            delete childDataComponent.bin;
        }
        return binComponent;
    }
    bin_2.parseFacet = parseFacet;
    function parseLayer(model) {
        var binComponent = parse(model);
        model.children().forEach(function (child) {
            var childDataComponent = child.component.data;
            if (!childDataComponent.source) {
                util_1.extend(binComponent, childDataComponent.bin);
                delete childDataComponent.bin;
            }
        });
        return binComponent;
    }
    bin_2.parseLayer = parseLayer;
    function assemble(component) {
        return util_1.flatten(util_1.vals(component.bin));
    }
    bin_2.assemble = assemble;
})(bin = exports.bin || (exports.bin = {}));

},{"../../bin":13,"../../channel":14,"../../fielddef":52,"../../util":61}],20:[function(require,module,exports){
"use strict";
var channel_1 = require('../../channel');
var type_1 = require('../../type');
var util_1 = require('../../util');
var colorRank;
(function (colorRank) {
    function parseUnit(model) {
        var colorRankComponent = {};
        if (model.has(channel_1.COLOR) && model.fieldDef(channel_1.COLOR).type === type_1.ORDINAL) {
            colorRankComponent[model.field(channel_1.COLOR)] = [{
                    type: 'sort',
                    by: model.field(channel_1.COLOR)
                }, {
                    type: 'rank',
                    field: model.field(channel_1.COLOR),
                    output: {
                        rank: model.field(channel_1.COLOR, { prefn: 'rank_' })
                    }
                }];
        }
        return colorRankComponent;
    }
    colorRank.parseUnit = parseUnit;
    function parseFacet(model) {
        var childDataComponent = model.child().component.data;
        if (!childDataComponent.source) {
            var colorRankComponent = childDataComponent.colorRank;
            delete childDataComponent.colorRank;
            return colorRankComponent;
        }
        return {};
    }
    colorRank.parseFacet = parseFacet;
    function parseLayer(model) {
        var colorRankComponent = {};
        model.children().forEach(function (child) {
            var childDataComponent = child.component.data;
            if (!childDataComponent.source) {
                util_1.extend(colorRankComponent, childDataComponent.colorRank);
                delete childDataComponent.colorRank;
            }
        });
        return colorRankComponent;
    }
    colorRank.parseLayer = parseLayer;
    function assemble(component) {
        return util_1.flatten(util_1.vals(component.colorRank));
    }
    colorRank.assemble = assemble;
})(colorRank = exports.colorRank || (exports.colorRank = {}));

},{"../../channel":14,"../../type":60,"../../util":61}],21:[function(require,module,exports){
"use strict";
var util_1 = require('../../util');
var source_1 = require('./source');
var formatparse_1 = require('./formatparse');
var nullfilter_1 = require('./nullfilter');
var filter_1 = require('./filter');
var bin_1 = require('./bin');
var formula_1 = require('./formula');
var nonpositivenullfilter_1 = require('./nonpositivenullfilter');
var summary_1 = require('./summary');
var stackscale_1 = require('./stackscale');
var timeunit_1 = require('./timeunit');
var timeunitdomain_1 = require('./timeunitdomain');
var colorrank_1 = require('./colorrank');
function parseUnitData(model) {
    return {
        formatParse: formatparse_1.formatParse.parseUnit(model),
        nullFilter: nullfilter_1.nullFilter.parseUnit(model),
        filter: filter_1.filter.parseUnit(model),
        nonPositiveFilter: nonpositivenullfilter_1.nonPositiveFilter.parseUnit(model),
        source: source_1.source.parseUnit(model),
        bin: bin_1.bin.parseUnit(model),
        calculate: formula_1.formula.parseUnit(model),
        timeUnit: timeunit_1.timeUnit.parseUnit(model),
        timeUnitDomain: timeunitdomain_1.timeUnitDomain.parseUnit(model),
        summary: summary_1.summary.parseUnit(model),
        stackScale: stackscale_1.stackScale.parseUnit(model),
        colorRank: colorrank_1.colorRank.parseUnit(model)
    };
}
exports.parseUnitData = parseUnitData;
function parseFacetData(model) {
    return {
        formatParse: formatparse_1.formatParse.parseFacet(model),
        nullFilter: nullfilter_1.nullFilter.parseFacet(model),
        filter: filter_1.filter.parseFacet(model),
        nonPositiveFilter: nonpositivenullfilter_1.nonPositiveFilter.parseFacet(model),
        source: source_1.source.parseFacet(model),
        bin: bin_1.bin.parseFacet(model),
        calculate: formula_1.formula.parseFacet(model),
        timeUnit: timeunit_1.timeUnit.parseFacet(model),
        timeUnitDomain: timeunitdomain_1.timeUnitDomain.parseFacet(model),
        summary: summary_1.summary.parseFacet(model),
        stackScale: stackscale_1.stackScale.parseFacet(model),
        colorRank: colorrank_1.colorRank.parseFacet(model)
    };
}
exports.parseFacetData = parseFacetData;
function parseLayerData(model) {
    return {
        filter: filter_1.filter.parseLayer(model),
        formatParse: formatparse_1.formatParse.parseLayer(model),
        nullFilter: nullfilter_1.nullFilter.parseLayer(model),
        nonPositiveFilter: nonpositivenullfilter_1.nonPositiveFilter.parseLayer(model),
        source: source_1.source.parseLayer(model),
        bin: bin_1.bin.parseLayer(model),
        calculate: formula_1.formula.parseLayer(model),
        timeUnit: timeunit_1.timeUnit.parseLayer(model),
        timeUnitDomain: timeunitdomain_1.timeUnitDomain.parseLayer(model),
        summary: summary_1.summary.parseLayer(model),
        stackScale: stackscale_1.stackScale.parseLayer(model),
        colorRank: colorrank_1.colorRank.parseLayer(model)
    };
}
exports.parseLayerData = parseLayerData;
function assembleData(model, data) {
    var component = model.component.data;
    var sourceData = source_1.source.assemble(model, component);
    if (sourceData) {
        data.push(sourceData);
    }
    summary_1.summary.assemble(component, model).forEach(function (summaryData) {
        data.push(summaryData);
    });
    if (data.length > 0) {
        var dataTable = data[data.length - 1];
        var colorRankTransform = colorrank_1.colorRank.assemble(component);
        if (colorRankTransform.length > 0) {
            dataTable.transform = (dataTable.transform || []).concat(colorRankTransform);
        }
        var nonPositiveFilterTransform = nonpositivenullfilter_1.nonPositiveFilter.assemble(component);
        if (nonPositiveFilterTransform.length > 0) {
            dataTable.transform = (dataTable.transform || []).concat(nonPositiveFilterTransform);
        }
    }
    else {
        if (util_1.keys(component.colorRank).length > 0) {
            throw new Error('Invalid colorRank not merged');
        }
        else if (util_1.keys(component.nonPositiveFilter).length > 0) {
            throw new Error('Invalid nonPositiveFilter not merged');
        }
    }
    var stackData = stackscale_1.stackScale.assemble(component);
    if (stackData) {
        data.push(stackData);
    }
    timeunitdomain_1.timeUnitDomain.assemble(component).forEach(function (timeUnitDomainData) {
        data.push(timeUnitDomainData);
    });
    return data;
}
exports.assembleData = assembleData;

},{"../../util":61,"./bin":19,"./colorrank":20,"./filter":22,"./formatparse":23,"./formula":24,"./nonpositivenullfilter":25,"./nullfilter":26,"./source":27,"./stackscale":28,"./summary":29,"./timeunit":30,"./timeunitdomain":31}],22:[function(require,module,exports){
"use strict";
var filter;
(function (filter_1) {
    function parse(model) {
        return model.transform().filter;
    }
    filter_1.parseUnit = parse;
    function parseFacet(model) {
        var filterComponent = parse(model);
        var childDataComponent = model.child().component.data;
        if (!childDataComponent.source && childDataComponent.filter) {
            filterComponent =
                (filterComponent ? filterComponent + ' && ' : '') +
                    childDataComponent.filter;
            delete childDataComponent.filter;
        }
        return filterComponent;
    }
    filter_1.parseFacet = parseFacet;
    function parseLayer(model) {
        var filterComponent = parse(model);
        model.children().forEach(function (child) {
            var childDataComponent = child.component.data;
            if (model.compatibleSource(child) && childDataComponent.filter && childDataComponent.filter === filterComponent) {
                delete childDataComponent.filter;
            }
        });
        return filterComponent;
    }
    filter_1.parseLayer = parseLayer;
    function assemble(component) {
        var filter = component.filter;
        return filter ? [{
                type: 'filter',
                test: filter
            }] : [];
    }
    filter_1.assemble = assemble;
})(filter = exports.filter || (exports.filter = {}));

},{}],23:[function(require,module,exports){
"use strict";
var fielddef_1 = require('../../fielddef');
var type_1 = require('../../type');
var util_1 = require('../../util');
var formatParse;
(function (formatParse) {
    function parse(model) {
        var calcFieldMap = (model.transform().calculate || []).reduce(function (fieldMap, formula) {
            fieldMap[formula.field] = true;
            return fieldMap;
        }, {});
        var parseComponent = {};
        model.forEach(function (fieldDef) {
            if (fieldDef.type === type_1.TEMPORAL) {
                parseComponent[fieldDef.field] = 'date';
            }
            else if (fieldDef.type === type_1.QUANTITATIVE) {
                if (fielddef_1.isCount(fieldDef) || calcFieldMap[fieldDef.field]) {
                    return;
                }
                parseComponent[fieldDef.field] = 'number';
            }
        });
        return parseComponent;
    }
    formatParse.parseUnit = parse;
    function parseFacet(model) {
        var parseComponent = parse(model);
        var childDataComponent = model.child().component.data;
        if (!childDataComponent.source && childDataComponent.formatParse) {
            util_1.extend(parseComponent, childDataComponent.formatParse);
            delete childDataComponent.formatParse;
        }
        return parseComponent;
    }
    formatParse.parseFacet = parseFacet;
    function parseLayer(model) {
        var parseComponent = parse(model);
        model.children().forEach(function (child) {
            var childDataComponent = child.component.data;
            if (model.compatibleSource(child) && !util_1.differ(childDataComponent.formatParse, parseComponent)) {
                util_1.extend(parseComponent, childDataComponent.formatParse);
                delete childDataComponent.formatParse;
            }
        });
        return parseComponent;
    }
    formatParse.parseLayer = parseLayer;
})(formatParse = exports.formatParse || (exports.formatParse = {}));

},{"../../fielddef":52,"../../type":60,"../../util":61}],24:[function(require,module,exports){
"use strict";
var util_1 = require('../../util');
var formula;
(function (formula_1) {
    function parse(model) {
        return (model.transform().calculate || []).reduce(function (formulaComponent, formula) {
            formulaComponent[util_1.hash(formula)] = formula;
            return formulaComponent;
        }, {});
    }
    formula_1.parseUnit = parse;
    function parseFacet(model) {
        var formulaComponent = parse(model);
        var childDataComponent = model.child().component.data;
        if (!childDataComponent.source) {
            util_1.extend(formulaComponent, childDataComponent.calculate);
            delete childDataComponent.calculate;
        }
        return formulaComponent;
    }
    formula_1.parseFacet = parseFacet;
    function parseLayer(model) {
        var formulaComponent = parse(model);
        model.children().forEach(function (child) {
            var childDataComponent = child.component.data;
            if (!childDataComponent.source && childDataComponent.calculate) {
                util_1.extend(formulaComponent || {}, childDataComponent.calculate);
                delete childDataComponent.calculate;
            }
        });
        return formulaComponent;
    }
    formula_1.parseLayer = parseLayer;
    function assemble(component) {
        return util_1.vals(component.calculate).reduce(function (transform, formula) {
            transform.push(util_1.extend({ type: 'formula' }, formula));
            return transform;
        }, []);
    }
    formula_1.assemble = assemble;
})(formula = exports.formula || (exports.formula = {}));

},{"../../util":61}],25:[function(require,module,exports){
"use strict";
var scale_1 = require('../../scale');
var util_1 = require('../../util');
var nonPositiveFilter;
(function (nonPositiveFilter_1) {
    function parseUnit(model) {
        return model.channels().reduce(function (nonPositiveComponent, channel) {
            var scale = model.scale(channel);
            if (!model.field(channel) || !scale) {
                return nonPositiveComponent;
            }
            nonPositiveComponent[model.field(channel)] = scale.type === scale_1.ScaleType.LOG;
            return nonPositiveComponent;
        }, {});
    }
    nonPositiveFilter_1.parseUnit = parseUnit;
    function parseFacet(model) {
        var childDataComponent = model.child().component.data;
        if (!childDataComponent.source) {
            var nonPositiveFilterComponent = childDataComponent.nonPositiveFilter;
            delete childDataComponent.nonPositiveFilter;
            return nonPositiveFilterComponent;
        }
        return {};
    }
    nonPositiveFilter_1.parseFacet = parseFacet;
    function parseLayer(model) {
        var nonPositiveFilter = {};
        model.children().forEach(function (child) {
            var childDataComponent = child.component.data;
            if (model.compatibleSource(child) && !util_1.differ(childDataComponent.nonPositiveFilter, nonPositiveFilter)) {
                util_1.extend(nonPositiveFilter, childDataComponent.nonPositiveFilter);
                delete childDataComponent.nonPositiveFilter;
            }
        });
        return nonPositiveFilter;
    }
    nonPositiveFilter_1.parseLayer = parseLayer;
    function assemble(component) {
        return util_1.keys(component.nonPositiveFilter).filter(function (field) {
            return component.nonPositiveFilter[field];
        }).map(function (field) {
            return {
                type: 'filter',
                test: 'datum.' + field + ' > 0'
            };
        });
    }
    nonPositiveFilter_1.assemble = assemble;
})(nonPositiveFilter = exports.nonPositiveFilter || (exports.nonPositiveFilter = {}));

},{"../../scale":55,"../../util":61}],26:[function(require,module,exports){
"use strict";
var util_1 = require('../../util');
var DEFAULT_NULL_FILTERS = {
    nominal: false,
    ordinal: false,
    quantitative: true,
    temporal: true
};
var nullFilter;
(function (nullFilter) {
    function parse(model) {
        var filterNull = model.transform().filterNull;
        return model.reduce(function (aggregator, fieldDef) {
            if (filterNull ||
                (filterNull === undefined && fieldDef.field && fieldDef.field !== '*' && DEFAULT_NULL_FILTERS[fieldDef.type])) {
                aggregator[fieldDef.field] = true;
            }
            else {
                aggregator[fieldDef.field] = false;
            }
            return aggregator;
        }, {});
    }
    nullFilter.parseUnit = parse;
    function parseFacet(model) {
        var nullFilterComponent = parse(model);
        var childDataComponent = model.child().component.data;
        if (!childDataComponent.source) {
            util_1.extend(nullFilterComponent, childDataComponent.nullFilter);
            delete childDataComponent.nullFilter;
        }
        return nullFilterComponent;
    }
    nullFilter.parseFacet = parseFacet;
    function parseLayer(model) {
        var nullFilterComponent = parse(model);
        model.children().forEach(function (child) {
            var childDataComponent = child.component.data;
            if (model.compatibleSource(child) && !util_1.differ(childDataComponent.nullFilter, nullFilterComponent)) {
                util_1.extend(nullFilterComponent, childDataComponent.nullFilter);
                delete childDataComponent.nullFilter;
            }
        });
        return nullFilterComponent;
    }
    nullFilter.parseLayer = parseLayer;
    function assemble(component) {
        var filteredFields = util_1.keys(component.nullFilter).filter(function (field) {
            return component.nullFilter[field];
        });
        return filteredFields.length > 0 ?
            [{
                    type: 'filter',
                    test: filteredFields.map(function (fieldName) {
                        return 'datum.' + fieldName + '!==null';
                    }).join(' && ')
                }] : [];
    }
    nullFilter.assemble = assemble;
})(nullFilter = exports.nullFilter || (exports.nullFilter = {}));

},{"../../util":61}],27:[function(require,module,exports){
"use strict";
var data_1 = require('../../data');
var util_1 = require('../../util');
var nullfilter_1 = require('./nullfilter');
var filter_1 = require('./filter');
var bin_1 = require('./bin');
var formula_1 = require('./formula');
var timeunit_1 = require('./timeunit');
var source;
(function (source) {
    function parse(model) {
        var data = model.data();
        if (data) {
            var sourceData = { name: model.dataName(data_1.SOURCE) };
            if (data.values && data.values.length > 0) {
                sourceData.values = model.data().values;
                sourceData.format = { type: 'json' };
            }
            else if (data.url) {
                sourceData.url = data.url;
                var defaultExtension = /(?:\.([^.]+))?$/.exec(sourceData.url)[1];
                if (!util_1.contains(['json', 'csv', 'tsv'], defaultExtension)) {
                    defaultExtension = 'json';
                }
                sourceData.format = { type: model.data().formatType || defaultExtension };
            }
            return sourceData;
        }
        else if (!model.parent()) {
            return { name: model.dataName(data_1.SOURCE) };
        }
        return undefined;
    }
    source.parseUnit = parse;
    function parseFacet(model) {
        var sourceData = parse(model);
        if (!model.child().component.data.source) {
            model.child().renameData(model.child().dataName(data_1.SOURCE), model.dataName(data_1.SOURCE));
        }
        return sourceData;
    }
    source.parseFacet = parseFacet;
    function parseLayer(model) {
        var sourceData = parse(model);
        model.children().forEach(function (child) {
            var childData = child.component.data;
            if (model.compatibleSource(child)) {
                var canMerge = !childData.filter && !childData.formatParse && !childData.nullFilter;
                if (canMerge) {
                    child.renameData(child.dataName(data_1.SOURCE), model.dataName(data_1.SOURCE));
                    delete childData.source;
                }
                else {
                    childData.source = {
                        name: child.dataName(data_1.SOURCE),
                        source: model.dataName(data_1.SOURCE)
                    };
                }
            }
        });
        return sourceData;
    }
    source.parseLayer = parseLayer;
    function assemble(model, component) {
        if (component.source) {
            var sourceData = component.source;
            if (component.formatParse) {
                component.source.format = component.source.format || {};
                component.source.format.parse = component.formatParse;
            }
            sourceData.transform = [].concat(nullfilter_1.nullFilter.assemble(component), formula_1.formula.assemble(component), filter_1.filter.assemble(component), bin_1.bin.assemble(component), timeunit_1.timeUnit.assemble(component));
            return sourceData;
        }
        return null;
    }
    source.assemble = assemble;
})(source = exports.source || (exports.source = {}));

},{"../../data":50,"../../util":61,"./bin":19,"./filter":22,"./formula":24,"./nullfilter":26,"./timeunit":30}],28:[function(require,module,exports){
"use strict";
var data_1 = require('../../data');
var fielddef_1 = require('../../fielddef');
var stackScale;
(function (stackScale) {
    function parseUnit(model) {
        var stackProps = model.stack();
        if (stackProps) {
            var groupbyChannel = stackProps.groupbyChannel;
            var fieldChannel = stackProps.fieldChannel;
            return {
                name: model.dataName(data_1.STACKED_SCALE),
                source: model.dataName(data_1.SUMMARY),
                transform: [{
                        type: 'aggregate',
                        groupby: [model.field(groupbyChannel)],
                        summarize: [{ ops: ['sum'], field: model.field(fieldChannel) }]
                    }]
            };
        }
        return null;
    }
    stackScale.parseUnit = parseUnit;
    ;
    function parseFacet(model) {
        var child = model.child();
        var childDataComponent = child.component.data;
        if (!childDataComponent.source && childDataComponent.stackScale) {
            var stackComponent = childDataComponent.stackScale;
            var newName = model.dataName(data_1.STACKED_SCALE);
            child.renameData(stackComponent.name, newName);
            stackComponent.name = newName;
            stackComponent.source = model.dataName(data_1.SUMMARY);
            stackComponent.transform[0].groupby = model.reduce(function (groupby, fieldDef) {
                groupby.push(fielddef_1.field(fieldDef));
                return groupby;
            }, stackComponent.transform[0].groupby);
            delete childDataComponent.stackScale;
            return stackComponent;
        }
        return null;
    }
    stackScale.parseFacet = parseFacet;
    function parseLayer(model) {
        return null;
    }
    stackScale.parseLayer = parseLayer;
    function assemble(component) {
        return component.stackScale;
    }
    stackScale.assemble = assemble;
})(stackScale = exports.stackScale || (exports.stackScale = {}));

},{"../../data":50,"../../fielddef":52}],29:[function(require,module,exports){
"use strict";
var aggregate_1 = require('../../aggregate');
var data_1 = require('../../data');
var fielddef_1 = require('../../fielddef');
var util_1 = require('../../util');
var summary;
(function (summary) {
    function addDimension(dims, fieldDef) {
        if (fieldDef.bin) {
            dims[fielddef_1.field(fieldDef, { binSuffix: '_start' })] = true;
            dims[fielddef_1.field(fieldDef, { binSuffix: '_mid' })] = true;
            dims[fielddef_1.field(fieldDef, { binSuffix: '_end' })] = true;
            dims[fielddef_1.field(fieldDef, { binSuffix: '_range' })] = true;
        }
        else {
            dims[fielddef_1.field(fieldDef)] = true;
        }
        return dims;
    }
    function parseUnit(model) {
        var dims = {};
        var meas = {};
        model.forEach(function (fieldDef, channel) {
            if (fieldDef.aggregate) {
                if (fieldDef.aggregate === aggregate_1.AggregateOp.COUNT) {
                    meas['*'] = meas['*'] || {};
                    meas['*']['count'] = true;
                }
                else {
                    meas[fieldDef.field] = meas[fieldDef.field] || {};
                    meas[fieldDef.field][fieldDef.aggregate] = true;
                }
            }
            else {
                addDimension(dims, fieldDef);
            }
        });
        return [{
                name: model.dataName(data_1.SUMMARY),
                dimensions: dims,
                measures: meas
            }];
    }
    summary.parseUnit = parseUnit;
    function parseFacet(model) {
        var childDataComponent = model.child().component.data;
        if (!childDataComponent.source && childDataComponent.summary) {
            var summaryComponents = childDataComponent.summary.map(function (summaryComponent) {
                summaryComponent.dimensions = model.reduce(addDimension, summaryComponent.dimensions);
                var summaryNameWithoutPrefix = summaryComponent.name.substr(model.child().name('').length);
                model.child().renameData(summaryComponent.name, summaryNameWithoutPrefix);
                summaryComponent.name = summaryNameWithoutPrefix;
                return summaryComponent;
            });
            delete childDataComponent.summary;
            return summaryComponents;
        }
        return [];
    }
    summary.parseFacet = parseFacet;
    function mergeMeasures(parentMeasures, childMeasures) {
        for (var field_1 in childMeasures) {
            if (childMeasures.hasOwnProperty(field_1)) {
                var ops = childMeasures[field_1];
                for (var op in ops) {
                    if (ops.hasOwnProperty(op)) {
                        if (field_1 in parentMeasures) {
                            parentMeasures[field_1][op] = true;
                        }
                        else {
                            parentMeasures[field_1] = { op: true };
                        }
                    }
                }
            }
        }
    }
    function parseLayer(model) {
        var summaries = {};
        model.children().forEach(function (child) {
            var childDataComponent = child.component.data;
            if (!childDataComponent.source && childDataComponent.summary) {
                childDataComponent.summary.forEach(function (childSummary) {
                    var key = util_1.hash(childSummary.dimensions);
                    if (key in summaries) {
                        mergeMeasures(summaries[key].measures, childSummary.measures);
                    }
                    else {
                        childSummary.name = model.dataName(data_1.SUMMARY) + '_' + util_1.keys(summaries).length;
                        summaries[key] = childSummary;
                    }
                    child.renameData(child.dataName(data_1.SUMMARY), summaries[key].name);
                    delete childDataComponent.summary;
                });
            }
        });
        return util_1.vals(summaries);
    }
    summary.parseLayer = parseLayer;
    function assemble(component, model) {
        if (!component.summary) {
            return [];
        }
        return component.summary.reduce(function (summaryData, summaryComponent) {
            var dims = summaryComponent.dimensions;
            var meas = summaryComponent.measures;
            var groupby = util_1.keys(dims);
            var summarize = util_1.reduce(meas, function (aggregator, fnDictSet, field) {
                aggregator[field] = util_1.keys(fnDictSet);
                return aggregator;
            }, {});
            if (util_1.keys(meas).length > 0) {
                summaryData.push({
                    name: summaryComponent.name,
                    source: model.dataName(data_1.SOURCE),
                    transform: [{
                            type: 'aggregate',
                            groupby: groupby,
                            summarize: summarize
                        }]
                });
            }
            return summaryData;
        }, []);
    }
    summary.assemble = assemble;
})(summary = exports.summary || (exports.summary = {}));

},{"../../aggregate":11,"../../data":50,"../../fielddef":52,"../../util":61}],30:[function(require,module,exports){
"use strict";
var fielddef_1 = require('../../fielddef');
var type_1 = require('../../type');
var util_1 = require('../../util');
var time_1 = require('./../time');
var timeUnit;
(function (timeUnit) {
    function parse(model) {
        return model.reduce(function (timeUnitComponent, fieldDef, channel) {
            var ref = fielddef_1.field(fieldDef, { nofn: true, datum: true });
            if (fieldDef.type === type_1.TEMPORAL && fieldDef.timeUnit) {
                var hash = fielddef_1.field(fieldDef);
                timeUnitComponent[hash] = {
                    type: 'formula',
                    field: fielddef_1.field(fieldDef),
                    expr: time_1.parseExpression(fieldDef.timeUnit, ref)
                };
            }
            return timeUnitComponent;
        }, {});
    }
    timeUnit.parseUnit = parse;
    function parseFacet(model) {
        var timeUnitComponent = parse(model);
        var childDataComponent = model.child().component.data;
        if (!childDataComponent.source) {
            util_1.extend(timeUnitComponent, childDataComponent.timeUnit);
            delete childDataComponent.timeUnit;
        }
        return timeUnitComponent;
    }
    timeUnit.parseFacet = parseFacet;
    function parseLayer(model) {
        var timeUnitComponent = parse(model);
        model.children().forEach(function (child) {
            var childDataComponent = child.component.data;
            if (!childDataComponent.source) {
                util_1.extend(timeUnitComponent, childDataComponent.timeUnit);
                delete childDataComponent.timeUnit;
            }
        });
        return timeUnitComponent;
    }
    timeUnit.parseLayer = parseLayer;
    function assemble(component) {
        return util_1.vals(component.timeUnit);
    }
    timeUnit.assemble = assemble;
})(timeUnit = exports.timeUnit || (exports.timeUnit = {}));

},{"../../fielddef":52,"../../type":60,"../../util":61,"./../time":47}],31:[function(require,module,exports){
"use strict";
var util_1 = require('../../util');
var time_1 = require('./../time');
var timeUnitDomain;
(function (timeUnitDomain) {
    function parse(model) {
        return model.reduce(function (timeUnitDomainMap, fieldDef, channel) {
            if (fieldDef.timeUnit) {
                var domain = time_1.rawDomain(fieldDef.timeUnit, channel);
                if (domain) {
                    timeUnitDomainMap[fieldDef.timeUnit] = true;
                }
            }
            return timeUnitDomainMap;
        }, {});
    }
    timeUnitDomain.parseUnit = parse;
    function parseFacet(model) {
        return util_1.extend(parse(model), model.child().component.data.timeUnitDomain);
    }
    timeUnitDomain.parseFacet = parseFacet;
    function parseLayer(model) {
        return util_1.extend(parse(model), model.children().forEach(function (child) {
            return child.component.data.timeUnitDomain;
        }));
    }
    timeUnitDomain.parseLayer = parseLayer;
    function assemble(component) {
        return util_1.keys(component.timeUnitDomain).reduce(function (timeUnitData, tu) {
            var timeUnit = tu;
            var domain = time_1.rawDomain(timeUnit, null);
            if (domain) {
                timeUnitData.push({
                    name: timeUnit,
                    values: domain,
                    transform: [{
                            type: 'formula',
                            field: 'date',
                            expr: time_1.parseExpression(timeUnit, 'datum.data', true)
                        }]
                });
            }
            return timeUnitData;
        }, []);
    }
    timeUnitDomain.assemble = assemble;
})(timeUnitDomain = exports.timeUnitDomain || (exports.timeUnitDomain = {}));

},{"../../util":61,"./../time":47}],32:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var axis_1 = require('../axis');
var channel_1 = require('../channel');
var config_1 = require('../config');
var data_1 = require('../data');
var encoding_1 = require('../encoding');
var fielddef_1 = require('../fielddef');
var scale_1 = require('../scale');
var type_1 = require('../type');
var util_1 = require('../util');
var axis_2 = require('./axis');
var common_1 = require('./common');
var data_2 = require('./data/data');
var layout_1 = require('./layout');
var model_1 = require('./model');
var scale_2 = require('./scale');
var FacetModel = (function (_super) {
    __extends(FacetModel, _super);
    function FacetModel(spec, parent, parentGivenName) {
        _super.call(this, spec, parent, parentGivenName);
        var config = this._config = this._initConfig(spec.config, parent);
        var child = this._child = common_1.buildModel(spec.spec, this, this.name('child'));
        var facet = this._facet = this._initFacet(spec.facet);
        this._scale = this._initScale(facet, config, child);
        this._axis = this._initAxis(facet, config, child);
    }
    FacetModel.prototype._initConfig = function (specConfig, parent) {
        return util_1.mergeDeep(util_1.duplicate(config_1.defaultConfig), specConfig, parent ? parent.config() : {});
    };
    FacetModel.prototype._initFacet = function (facet) {
        facet = util_1.duplicate(facet);
        var model = this;
        encoding_1.channelMappingForEach(this.channels(), facet, function (fieldDef, channel) {
            if (!fielddef_1.isDimension(fieldDef)) {
                model.addWarning(channel + ' encoding should be ordinal.');
            }
            if (fieldDef.type) {
                fieldDef.type = type_1.getFullName(fieldDef.type);
            }
        });
        return facet;
    };
    FacetModel.prototype._initScale = function (facet, config, child) {
        return [channel_1.ROW, channel_1.COLUMN].reduce(function (_scale, channel) {
            if (facet[channel]) {
                var scaleSpec = facet[channel].scale || {};
                _scale[channel] = util_1.extend({
                    type: scale_1.ScaleType.ORDINAL,
                    round: config.facet.scale.round,
                    padding: (channel === channel_1.ROW && child.has(channel_1.Y)) || (channel === channel_1.COLUMN && child.has(channel_1.X)) ?
                        config.facet.scale.padding : 0
                }, scaleSpec);
            }
            return _scale;
        }, {});
    };
    FacetModel.prototype._initAxis = function (facet, config, child) {
        return [channel_1.ROW, channel_1.COLUMN].reduce(function (_axis, channel) {
            if (facet[channel]) {
                var axisSpec = facet[channel].axis;
                if (axisSpec !== false) {
                    var modelAxis = _axis[channel] = util_1.extend({}, config.facet.axis, axisSpec === true ? {} : axisSpec || {});
                    if (channel === channel_1.ROW) {
                        var yAxis = child.axis(channel_1.Y);
                        if (yAxis && yAxis.orient !== axis_1.AxisOrient.RIGHT && !modelAxis.orient) {
                            modelAxis.orient = axis_1.AxisOrient.RIGHT;
                        }
                        if (child.has(channel_1.X) && !modelAxis.labelAngle) {
                            modelAxis.labelAngle = modelAxis.orient === axis_1.AxisOrient.RIGHT ? 90 : 270;
                        }
                    }
                }
            }
            return _axis;
        }, {});
    };
    FacetModel.prototype.facet = function () {
        return this._facet;
    };
    FacetModel.prototype.has = function (channel) {
        return !!this._facet[channel];
    };
    FacetModel.prototype.child = function () {
        return this._child;
    };
    FacetModel.prototype.hasSummary = function () {
        var summary = this.component.data.summary;
        for (var i = 0; i < summary.length; i++) {
            if (util_1.keys(summary[i].measures).length > 0) {
                return true;
            }
        }
        return false;
    };
    FacetModel.prototype.dataTable = function () {
        return (this.hasSummary() ? data_1.SUMMARY : data_1.SOURCE) + '';
    };
    FacetModel.prototype.fieldDef = function (channel) {
        return this.facet()[channel];
    };
    FacetModel.prototype.stack = function () {
        return null;
    };
    FacetModel.prototype.parseData = function () {
        this.child().parseData();
        this.component.data = data_2.parseFacetData(this);
    };
    FacetModel.prototype.parseSelectionData = function () {
    };
    FacetModel.prototype.parseLayoutData = function () {
        this.child().parseLayoutData();
        this.component.layout = layout_1.parseFacetLayout(this);
    };
    FacetModel.prototype.parseScale = function () {
        var child = this.child();
        var model = this;
        child.parseScale();
        var scaleComponent = this.component.scale = scale_2.parseScaleComponent(this);
        util_1.keys(child.component.scale).forEach(function (channel) {
            if (true) {
                scaleComponent[channel] = child.component.scale[channel];
                util_1.vals(scaleComponent[channel]).forEach(function (scale) {
                    var scaleNameWithoutPrefix = scale.name.substr(child.name('').length);
                    var newName = model.scaleName(scaleNameWithoutPrefix);
                    child.renameScale(scale.name, newName);
                    scale.name = newName;
                });
                delete child.component.scale[channel];
            }
        });
    };
    FacetModel.prototype.parseMark = function () {
        this.child().parseMark();
        this.component.mark = util_1.extend({
            name: this.name('cell'),
            type: 'group',
            from: util_1.extend(this.dataTable() ? { data: this.dataTable() } : {}, {
                transform: [{
                        type: 'facet',
                        groupby: [].concat(this.has(channel_1.ROW) ? [this.field(channel_1.ROW)] : [], this.has(channel_1.COLUMN) ? [this.field(channel_1.COLUMN)] : [])
                    }]
            }),
            properties: {
                update: getFacetGroupProperties(this)
            }
        }, this.child().assembleGroup());
    };
    FacetModel.prototype.parseAxis = function () {
        this.child().parseAxis();
        this.component.axis = axis_2.parseAxisComponent(this, [channel_1.ROW, channel_1.COLUMN]);
    };
    FacetModel.prototype.parseAxisGroup = function () {
        var xAxisGroup = parseAxisGroup(this, channel_1.X);
        var yAxisGroup = parseAxisGroup(this, channel_1.Y);
        this.component.axisGroup = util_1.extend(xAxisGroup ? { x: xAxisGroup } : {}, yAxisGroup ? { y: yAxisGroup } : {});
    };
    FacetModel.prototype.parseGridGroup = function () {
        var child = this.child();
        this.component.gridGroup = util_1.extend(!child.has(channel_1.X) && this.has(channel_1.COLUMN) ? { column: getColumnGridGroups(this) } : {}, !child.has(channel_1.Y) && this.has(channel_1.ROW) ? { row: getRowGridGroups(this) } : {});
    };
    FacetModel.prototype.parseLegend = function () {
        this.child().parseLegend();
        this.component.legend = this._child.component.legend;
        this._child.component.legend = {};
    };
    FacetModel.prototype.assembleParentGroupProperties = function () {
        return null;
    };
    FacetModel.prototype.assembleData = function (data) {
        data_2.assembleData(this, data);
        return this._child.assembleData(data);
    };
    FacetModel.prototype.assembleLayout = function (layoutData) {
        this._child.assembleLayout(layoutData);
        return layout_1.assembleLayout(this, layoutData);
    };
    FacetModel.prototype.assembleMarks = function () {
        return [].concat(util_1.vals(this.component.axisGroup), util_1.flatten(util_1.vals(this.component.gridGroup)), this.component.mark);
    };
    FacetModel.prototype.channels = function () {
        return [channel_1.ROW, channel_1.COLUMN];
    };
    FacetModel.prototype.mapping = function () {
        return this.facet();
    };
    FacetModel.prototype.isFacet = function () {
        return true;
    };
    return FacetModel;
}(model_1.Model));
exports.FacetModel = FacetModel;
function getFacetGroupProperties(model) {
    var child = model.child();
    var mergedCellConfig = util_1.extend({}, child.config().cell, child.config().facet.cell);
    return util_1.extend({
        x: model.has(channel_1.COLUMN) ? {
            scale: model.scaleName(channel_1.COLUMN),
            field: model.field(channel_1.COLUMN),
            offset: model.scale(channel_1.COLUMN).padding / 2
        } : { value: model.config().facet.scale.padding / 2 },
        y: model.has(channel_1.ROW) ? {
            scale: model.scaleName(channel_1.ROW),
            field: model.field(channel_1.ROW),
            offset: model.scale(channel_1.ROW).padding / 2
        } : { value: model.config().facet.scale.padding / 2 },
        width: { field: { parent: model.child().sizeName('width') } },
        height: { field: { parent: model.child().sizeName('height') } }
    }, child.assembleParentGroupProperties(mergedCellConfig));
}
function parseAxisGroup(model, channel) {
    var axisGroup = null;
    var child = model.child();
    if (child.has(channel)) {
        if (child.axis(channel)) {
            if (true) {
                axisGroup = channel === channel_1.X ? getXAxesGroup(model) : getYAxesGroup(model);
                if (child.axis(channel) && axis_2.gridShow(child, channel)) {
                    child.component.axis[channel] = axis_2.parseInnerAxis(channel, child);
                }
                else {
                    delete child.component.axis[channel];
                }
            }
            else {
            }
        }
    }
    return axisGroup;
}
function getXAxesGroup(model) {
    var hasCol = model.has(channel_1.COLUMN);
    return util_1.extend({
        name: model.name('x-axes'),
        type: 'group'
    }, hasCol ? {
        from: {
            data: model.dataTable(),
            transform: [{
                    type: 'aggregate',
                    groupby: [model.field(channel_1.COLUMN)],
                    summarize: { '*': ['count'] }
                }]
        }
    } : {}, {
        properties: {
            update: {
                width: { field: { parent: model.child().sizeName('width') } },
                height: {
                    field: { group: 'height' }
                },
                x: hasCol ? {
                    scale: model.scaleName(channel_1.COLUMN),
                    field: model.field(channel_1.COLUMN),
                    offset: model.scale(channel_1.COLUMN).padding / 2
                } : {
                    value: model.config().facet.scale.padding / 2
                }
            }
        },
        axes: [axis_2.parseAxis(channel_1.X, model.child())]
    });
}
function getYAxesGroup(model) {
    var hasRow = model.has(channel_1.ROW);
    return util_1.extend({
        name: model.name('y-axes'),
        type: 'group'
    }, hasRow ? {
        from: {
            data: model.dataTable(),
            transform: [{
                    type: 'aggregate',
                    groupby: [model.field(channel_1.ROW)],
                    summarize: { '*': ['count'] }
                }]
        }
    } : {}, {
        properties: {
            update: {
                width: {
                    field: { group: 'width' }
                },
                height: { field: { parent: model.child().sizeName('height') } },
                y: hasRow ? {
                    scale: model.scaleName(channel_1.ROW),
                    field: model.field(channel_1.ROW),
                    offset: model.scale(channel_1.ROW).padding / 2
                } : {
                    value: model.config().facet.scale.padding / 2
                }
            }
        },
        axes: [axis_2.parseAxis(channel_1.Y, model.child())]
    });
}
function getRowGridGroups(model) {
    var facetGridConfig = model.config().facet.grid;
    var rowGrid = {
        name: model.name('row-grid'),
        type: 'rule',
        from: {
            data: model.dataTable(),
            transform: [{ type: 'facet', groupby: [model.field(channel_1.ROW)] }]
        },
        properties: {
            update: {
                y: {
                    scale: model.scaleName(channel_1.ROW),
                    field: model.field(channel_1.ROW)
                },
                x: { value: 0, offset: -facetGridConfig.offset },
                x2: { field: { group: 'width' }, offset: facetGridConfig.offset },
                stroke: { value: facetGridConfig.color },
                strokeOpacity: { value: facetGridConfig.opacity },
                strokeWidth: { value: 0.5 }
            }
        }
    };
    return [rowGrid, {
            name: model.name('row-grid-end'),
            type: 'rule',
            properties: {
                update: {
                    y: { field: { group: 'height' } },
                    x: { value: 0, offset: -facetGridConfig.offset },
                    x2: { field: { group: 'width' }, offset: facetGridConfig.offset },
                    stroke: { value: facetGridConfig.color },
                    strokeOpacity: { value: facetGridConfig.opacity },
                    strokeWidth: { value: 0.5 }
                }
            }
        }];
}
function getColumnGridGroups(model) {
    var facetGridConfig = model.config().facet.grid;
    var columnGrid = {
        name: model.name('column-grid'),
        type: 'rule',
        from: {
            data: model.dataTable(),
            transform: [{ type: 'facet', groupby: [model.field(channel_1.COLUMN)] }]
        },
        properties: {
            update: {
                x: {
                    scale: model.scaleName(channel_1.COLUMN),
                    field: model.field(channel_1.COLUMN)
                },
                y: { value: 0, offset: -facetGridConfig.offset },
                y2: { field: { group: 'height' }, offset: facetGridConfig.offset },
                stroke: { value: facetGridConfig.color },
                strokeOpacity: { value: facetGridConfig.opacity },
                strokeWidth: { value: 0.5 }
            }
        }
    };
    return [columnGrid, {
            name: model.name('column-grid-end'),
            type: 'rule',
            properties: {
                update: {
                    x: { field: { group: 'width' } },
                    y: { value: 0, offset: -facetGridConfig.offset },
                    y2: { field: { group: 'height' }, offset: facetGridConfig.offset },
                    stroke: { value: facetGridConfig.color },
                    strokeOpacity: { value: facetGridConfig.opacity },
                    strokeWidth: { value: 0.5 }
                }
            }
        }];
}

},{"../axis":12,"../channel":14,"../config":49,"../data":50,"../encoding":51,"../fielddef":52,"../scale":55,"../type":60,"../util":61,"./axis":15,"./common":16,"./data/data":21,"./layout":34,"./model":44,"./scale":45}],33:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var util_1 = require('../util');
var config_1 = require('../config');
var data_1 = require('./data/data');
var layout_1 = require('./layout');
var model_1 = require('./model');
var common_1 = require('./common');
var vega_schema_1 = require('../vega.schema');
var LayerModel = (function (_super) {
    __extends(LayerModel, _super);
    function LayerModel(spec, parent, parentGivenName) {
        var _this = this;
        _super.call(this, spec, parent, parentGivenName);
        this._config = this._initConfig(spec.config, parent);
        this._children = spec.layers.map(function (layer, i) {
            return common_1.buildModel(layer, _this, _this.name('layer_' + i));
        });
    }
    LayerModel.prototype._initConfig = function (specConfig, parent) {
        return util_1.mergeDeep(util_1.duplicate(config_1.defaultConfig), specConfig, parent ? parent.config() : {});
    };
    LayerModel.prototype.has = function (channel) {
        return false;
    };
    LayerModel.prototype.children = function () {
        return this._children;
    };
    LayerModel.prototype.isOrdinalScale = function (channel) {
        return this._children[0].isOrdinalScale(channel);
    };
    LayerModel.prototype.dataTable = function () {
        return this._children[0].dataTable();
    };
    LayerModel.prototype.fieldDef = function (channel) {
        return null;
    };
    LayerModel.prototype.stack = function () {
        return null;
    };
    LayerModel.prototype.parseData = function () {
        this._children.forEach(function (child) {
            child.parseData();
        });
        this.component.data = data_1.parseLayerData(this);
    };
    LayerModel.prototype.parseSelectionData = function () {
    };
    LayerModel.prototype.parseLayoutData = function () {
        this._children.forEach(function (child, i) {
            child.parseLayoutData();
        });
        this.component.layout = layout_1.parseLayerLayout(this);
    };
    LayerModel.prototype.parseScale = function () {
        var model = this;
        var scaleComponent = this.component.scale = {};
        this._children.forEach(function (child) {
            child.parseScale();
            if (true) {
                util_1.keys(child.component.scale).forEach(function (channel) {
                    var childScales = child.component.scale[channel];
                    if (!childScales) {
                        return;
                    }
                    var modelScales = scaleComponent[channel];
                    if (modelScales && modelScales.main) {
                        var modelDomain = modelScales.main.domain;
                        var childDomain = childScales.main.domain;
                        if (util_1.isArray(modelDomain)) {
                            if (util_1.isArray(childScales.main.domain)) {
                                modelScales.main.domain = modelDomain.concat(childDomain);
                            }
                            else {
                                model.addWarning('custom domain scale cannot be unioned with default field-based domain');
                            }
                        }
                        else {
                            var unionedFields = vega_schema_1.isUnionedDomain(modelDomain) ? modelDomain.fields : [modelDomain];
                            if (util_1.isArray(childDomain)) {
                                model.addWarning('custom domain scale cannot be unioned with default field-based domain');
                            }
                            var fields = vega_schema_1.isDataRefDomain(childDomain) ? unionedFields.concat([childDomain]) :
                                vega_schema_1.isUnionedDomain(childDomain) ? unionedFields.concat(childDomain.fields) :
                                    unionedFields;
                            fields = util_1.unique(fields, util_1.hash);
                            if (fields.length > 1) {
                                modelScales.main.domain = { fields: fields };
                            }
                            else {
                                modelScales.main.domain = fields[0];
                            }
                        }
                        modelScales.colorLegend = modelScales.colorLegend ? modelScales.colorLegend : childScales.colorLegend;
                        modelScales.binColorLegend = modelScales.binColorLegend ? modelScales.binColorLegend : childScales.binColorLegend;
                    }
                    else {
                        scaleComponent[channel] = childScales;
                    }
                    util_1.vals(childScales).forEach(function (scale) {
                        var scaleNameWithoutPrefix = scale.name.substr(child.name('').length);
                        var newName = model.scaleName(scaleNameWithoutPrefix);
                        child.renameScale(scale.name, newName);
                        scale.name = newName;
                    });
                    delete childScales[channel];
                });
            }
        });
    };
    LayerModel.prototype.parseMark = function () {
        this._children.forEach(function (child) {
            child.parseMark();
        });
    };
    LayerModel.prototype.parseAxis = function () {
        var axisComponent = this.component.axis = {};
        this._children.forEach(function (child) {
            child.parseAxis();
            if (true) {
                util_1.keys(child.component.axis).forEach(function (channel) {
                    if (!axisComponent[channel]) {
                        axisComponent[channel] = child.component.axis[channel];
                    }
                });
            }
        });
    };
    LayerModel.prototype.parseAxisGroup = function () {
        return null;
    };
    LayerModel.prototype.parseGridGroup = function () {
        return null;
    };
    LayerModel.prototype.parseLegend = function () {
        var legendComponent = this.component.legend = {};
        this._children.forEach(function (child) {
            child.parseLegend();
            if (true) {
                util_1.keys(child.component.legend).forEach(function (channel) {
                    if (!legendComponent[channel]) {
                        legendComponent[channel] = child.component.legend[channel];
                    }
                });
            }
        });
    };
    LayerModel.prototype.assembleParentGroupProperties = function () {
        return null;
    };
    LayerModel.prototype.assembleData = function (data) {
        data_1.assembleData(this, data);
        this._children.forEach(function (child) {
            child.assembleData(data);
        });
        return data;
    };
    LayerModel.prototype.assembleLayout = function (layoutData) {
        this._children.forEach(function (child) {
            child.assembleLayout(layoutData);
        });
        return layout_1.assembleLayout(this, layoutData);
    };
    LayerModel.prototype.assembleMarks = function () {
        return util_1.flatten(this._children.map(function (child) {
            return child.assembleMarks();
        }));
    };
    LayerModel.prototype.channels = function () {
        return [];
    };
    LayerModel.prototype.mapping = function () {
        return null;
    };
    LayerModel.prototype.isLayer = function () {
        return true;
    };
    LayerModel.prototype.compatibleSource = function (child) {
        var sourceUrl = this.data().url;
        var childData = child.component.data;
        var compatible = !childData.source || (sourceUrl && sourceUrl === childData.source.url);
        return compatible;
    };
    return LayerModel;
}(model_1.Model));
exports.LayerModel = LayerModel;

},{"../config":49,"../util":61,"../vega.schema":63,"./common":16,"./data/data":21,"./layout":34,"./model":44}],34:[function(require,module,exports){
"use strict";
var channel_1 = require('../channel');
var data_1 = require('../data');
var scale_1 = require('../scale');
var util_1 = require('../util');
var mark_1 = require('../mark');
var time_1 = require('./time');
function assembleLayout(model, layoutData) {
    var layoutComponent = model.component.layout;
    if (!layoutComponent.width && !layoutComponent.height) {
        return layoutData;
    }
    if (true) {
        var distinctFields = util_1.keys(util_1.extend(layoutComponent.width.distinct, layoutComponent.height.distinct));
        var formula = layoutComponent.width.formula.concat(layoutComponent.height.formula)
            .map(function (formula) {
            return util_1.extend({ type: 'formula' }, formula);
        });
        return [
            distinctFields.length > 0 ? {
                name: model.dataName(data_1.LAYOUT),
                source: model.dataTable(),
                transform: [{
                        type: 'aggregate',
                        summarize: distinctFields.map(function (field) {
                            return { field: field, ops: ['distinct'] };
                        })
                    }].concat(formula)
            } : {
                name: model.dataName(data_1.LAYOUT),
                values: [{}],
                transform: formula
            }
        ];
    }
}
exports.assembleLayout = assembleLayout;
function parseUnitLayout(model) {
    return {
        width: parseUnitSizeLayout(model, channel_1.X),
        height: parseUnitSizeLayout(model, channel_1.Y)
    };
}
exports.parseUnitLayout = parseUnitLayout;
function parseUnitSizeLayout(model, channel) {
    var cellConfig = model.config().cell;
    var nonOrdinalSize = channel === channel_1.X ? cellConfig.width : cellConfig.height;
    return {
        distinct: getDistinct(model, channel),
        formula: [{
                field: model.channelSizeName(channel),
                expr: unitSizeExpr(model, channel, nonOrdinalSize)
            }]
    };
}
function unitSizeExpr(model, channel, nonOrdinalSize) {
    if (model.scale(channel) !== null) {
        if (model.isOrdinalScale(channel)) {
            var scale = model.scale(channel);
            return '(' + cardinalityFormula(model, channel) +
                ' + ' + scale.padding +
                ') * ' + scale.bandSize;
        }
        else {
            return nonOrdinalSize + '';
        }
    }
    else {
        if (model.mark() === mark_1.TEXT && channel === channel_1.X) {
            return model.config().scale.textBandWidth + '';
        }
        return model.config().scale.bandSize + '';
    }
}
function parseFacetLayout(model) {
    return {
        width: parseFacetSizeLayout(model, channel_1.COLUMN),
        height: parseFacetSizeLayout(model, channel_1.ROW)
    };
}
exports.parseFacetLayout = parseFacetLayout;
function parseFacetSizeLayout(model, channel) {
    var childLayoutComponent = model.child().component.layout;
    var sizeType = channel === channel_1.ROW ? 'height' : 'width';
    var childSizeComponent = childLayoutComponent[sizeType];
    if (true) {
        var distinct = util_1.extend(getDistinct(model, channel), childSizeComponent.distinct);
        var formula = childSizeComponent.formula.concat([{
                field: model.channelSizeName(channel),
                expr: facetSizeFormula(model, channel, model.child().channelSizeName(channel))
            }]);
        delete childLayoutComponent[sizeType];
        return {
            distinct: distinct,
            formula: formula
        };
    }
}
function facetSizeFormula(model, channel, innerSize) {
    var scale = model.scale(channel);
    if (model.has(channel)) {
        return '(datum.' + innerSize + ' + ' + scale.padding + ')' + ' * ' + cardinalityFormula(model, channel);
    }
    else {
        return 'datum.' + innerSize + ' + ' + model.config().facet.scale.padding;
    }
}
function parseLayerLayout(model) {
    return {
        width: parseLayerSizeLayout(model, channel_1.X),
        height: parseLayerSizeLayout(model, channel_1.Y)
    };
}
exports.parseLayerLayout = parseLayerLayout;
function parseLayerSizeLayout(model, channel) {
    if (true) {
        var childLayoutComponent = model.children()[0].component.layout;
        var sizeType_1 = channel === channel_1.Y ? 'height' : 'width';
        var childSizeComponent = childLayoutComponent[sizeType_1];
        var distinct = childSizeComponent.distinct;
        var formula = [{
                field: model.channelSizeName(channel),
                expr: childSizeComponent.formula[0].expr
            }];
        model.children().forEach(function (child) {
            delete child.component.layout[sizeType_1];
        });
        return {
            distinct: distinct,
            formula: formula
        };
    }
}
function getDistinct(model, channel) {
    if (model.has(channel) && model.isOrdinalScale(channel)) {
        var scale = model.scale(channel);
        if (scale.type === scale_1.ScaleType.ORDINAL && !(scale.domain instanceof Array)) {
            var distinctField = model.field(channel);
            var distinct = {};
            distinct[distinctField] = true;
            return distinct;
        }
    }
    return {};
}
function cardinalityFormula(model, channel) {
    var scale = model.scale(channel);
    if (scale.domain instanceof Array) {
        return scale.domain.length;
    }
    var timeUnit = model.fieldDef(channel).timeUnit;
    var timeUnitDomain = timeUnit ? time_1.rawDomain(timeUnit, channel) : null;
    return timeUnitDomain !== null ? timeUnitDomain.length :
        model.field(channel, { datum: true, prefn: 'distinct_' });
}

},{"../channel":14,"../data":50,"../mark":54,"../scale":55,"../util":61,"./time":47}],35:[function(require,module,exports){
"use strict";
var channel_1 = require('../channel');
var fielddef_1 = require('../fielddef');
var mark_1 = require('../mark');
var type_1 = require('../type');
var util_1 = require('../util');
var common_1 = require('./common');
var timeunit_1 = require('../timeunit');
var scale_1 = require('./scale');
function parseLegendComponent(model) {
    return [channel_1.COLOR, channel_1.SIZE, channel_1.SHAPE].reduce(function (legendComponent, channel) {
        if (model.legend(channel)) {
            legendComponent[channel] = parseLegend(model, channel);
        }
        return legendComponent;
    }, {});
}
exports.parseLegendComponent = parseLegendComponent;
function getLegendDefWithScale(model, channel) {
    switch (channel) {
        case channel_1.COLOR:
            var fieldDef = model.fieldDef(channel_1.COLOR);
            var scale = model.scaleName(useColorLegendScale(fieldDef) ?
                scale_1.COLOR_LEGEND :
                channel_1.COLOR);
            return model.config().mark.filled ? { fill: scale } : { stroke: scale };
        case channel_1.SIZE:
            return { size: model.scaleName(channel_1.SIZE) };
        case channel_1.SHAPE:
            return { shape: model.scaleName(channel_1.SHAPE) };
    }
    return null;
}
function parseLegend(model, channel) {
    var fieldDef = model.fieldDef(channel);
    var legend = model.legend(channel);
    var def = getLegendDefWithScale(model, channel);
    def.title = title(legend, fieldDef);
    def.offset = offset(legend, fieldDef);
    util_1.extend(def, formatMixins(legend, model, channel));
    ['orient', 'values'].forEach(function (property) {
        var value = legend[property];
        if (value !== undefined) {
            def[property] = value;
        }
    });
    var props = (typeof legend !== 'boolean' && legend.properties) || {};
    ['title', 'symbols', 'legend', 'labels'].forEach(function (group) {
        var value = properties[group] ?
            properties[group](fieldDef, props[group], model, channel) :
            props[group];
        if (value !== undefined && util_1.keys(value).length > 0) {
            def.properties = def.properties || {};
            def.properties[group] = value;
        }
    });
    return def;
}
exports.parseLegend = parseLegend;
function offset(legend, fieldDef) {
    if (legend.offset !== undefined) {
        return legend.offset;
    }
    return 0;
}
exports.offset = offset;
function orient(legend, fieldDef) {
    var orient = legend.orient;
    if (orient) {
        return orient;
    }
    return 'vertical';
}
exports.orient = orient;
function title(legend, fieldDef) {
    if (typeof legend !== 'boolean' && legend.title) {
        return legend.title;
    }
    return fielddef_1.title(fieldDef);
}
exports.title = title;
function formatMixins(legend, model, channel) {
    var fieldDef = model.fieldDef(channel);
    if (fieldDef.bin) {
        return {};
    }
    return common_1.formatMixins(model, fieldDef, typeof legend !== 'boolean' ? legend.format : undefined, model.legend(channel).shortTimeLabels);
}
exports.formatMixins = formatMixins;
function useColorLegendScale(fieldDef) {
    return fieldDef.type === type_1.ORDINAL || fieldDef.bin || fieldDef.timeUnit;
}
exports.useColorLegendScale = useColorLegendScale;
var properties;
(function (properties) {
    function symbols(fieldDef, symbolsSpec, model, channel) {
        var symbols = {};
        var mark = model.mark();
        var legend = model.legend(channel);
        switch (mark) {
            case mark_1.BAR:
            case mark_1.TICK:
            case mark_1.TEXT:
                symbols.shape = { value: 'square' };
                break;
            case mark_1.CIRCLE:
            case mark_1.SQUARE:
                symbols.shape = { value: mark };
                break;
            case mark_1.POINT:
            case mark_1.LINE:
            case mark_1.AREA:
                break;
        }
        var filled = model.config().mark.filled;
        var config = channel === channel_1.COLOR ?
            util_1.without(common_1.FILL_STROKE_CONFIG, [filled ? 'fill' : 'stroke', 'strokeDash', 'strokeDashOffset']) :
            util_1.without(common_1.FILL_STROKE_CONFIG, ['strokeDash', 'strokeDashOffset']);
        config = util_1.without(config, ['strokeDash', 'strokeDashOffset']);
        common_1.applyMarkConfig(symbols, model, config);
        if (filled) {
            symbols.strokeWidth = { value: 0 };
        }
        var value;
        if (model.has(channel_1.COLOR) && channel === channel_1.COLOR) {
            if (useColorLegendScale(fieldDef)) {
                value = { scale: model.scaleName(channel_1.COLOR), field: 'data' };
            }
        }
        else if (model.fieldDef(channel_1.COLOR).value) {
            value = { value: model.fieldDef(channel_1.COLOR).value };
        }
        if (value !== undefined) {
            if (filled) {
                symbols.fill = value;
            }
            else {
                symbols.stroke = value;
            }
        }
        else if (channel !== channel_1.COLOR) {
            symbols[filled ? 'fill' : 'stroke'] = symbols[filled ? 'fill' : 'stroke'] ||
                { value: model.config().mark.color };
        }
        if (legend.symbolColor !== undefined) {
            symbols.fill = { value: legend.symbolColor };
        }
        if (legend.symbolShape !== undefined) {
            symbols.shape = { value: legend.symbolShape };
        }
        if (legend.symbolSize !== undefined) {
            symbols.size = { value: legend.symbolSize };
        }
        if (legend.symbolStrokeWidth !== undefined) {
            symbols.strokeWidth = { value: legend.symbolStrokeWidth };
        }
        symbols = util_1.extend(symbols, symbolsSpec || {});
        return util_1.keys(symbols).length > 0 ? symbols : undefined;
    }
    properties.symbols = symbols;
    function labels(fieldDef, labelsSpec, model, channel) {
        var legend = model.legend(channel);
        var labels = {};
        if (channel === channel_1.COLOR) {
            if (fieldDef.type === type_1.ORDINAL) {
                labelsSpec = util_1.extend({
                    text: {
                        scale: model.scaleName(scale_1.COLOR_LEGEND),
                        field: 'data'
                    }
                }, labelsSpec || {});
            }
            else if (fieldDef.bin) {
                labelsSpec = util_1.extend({
                    text: {
                        scale: model.scaleName(scale_1.COLOR_LEGEND_LABEL),
                        field: 'data'
                    }
                }, labelsSpec || {});
            }
            else if (fieldDef.timeUnit) {
                labelsSpec = util_1.extend({
                    text: {
                        template: '{{ datum.data | time:\'' + timeunit_1.format(fieldDef.timeUnit, legend.shortTimeLabels) + '\'}}'
                    }
                }, labelsSpec || {});
            }
        }
        if (legend.labelAlign !== undefined) {
            labels.align = { value: legend.labelAlign };
        }
        if (legend.labelColor !== undefined) {
            labels.stroke = { value: legend.labelColor };
        }
        if (legend.labelFont !== undefined) {
            labels.font = { value: legend.labelFont };
        }
        if (legend.labelFontSize !== undefined) {
            labels.fontSize = { value: legend.labelFontSize };
        }
        if (legend.labelBaseline !== undefined) {
            labels.baseline = { value: legend.labelBaseline };
        }
        labels = util_1.extend(labels, labelsSpec || {});
        return util_1.keys(labels).length > 0 ? labels : undefined;
    }
    properties.labels = labels;
    function title(fieldDef, titleSpec, model, channel) {
        var legend = model.legend(channel);
        var titles = {};
        if (legend.titleColor !== undefined) {
            titles.stroke = { value: legend.titleColor };
        }
        if (legend.titleFont !== undefined) {
            titles.font = { value: legend.titleFont };
        }
        if (legend.titleFontSize !== undefined) {
            titles.fontSize = { value: legend.titleFontSize };
        }
        if (legend.titleFontWeight !== undefined) {
            titles.fontWeight = { value: legend.titleFontWeight };
        }
        titles = util_1.extend(titles, titleSpec || {});
        return util_1.keys(titles).length > 0 ? titles : undefined;
    }
    properties.title = title;
})(properties = exports.properties || (exports.properties = {}));

},{"../channel":14,"../fielddef":52,"../mark":54,"../timeunit":59,"../type":60,"../util":61,"./common":16,"./scale":45}],36:[function(require,module,exports){
"use strict";
var channel_1 = require('../../channel');
var fielddef_1 = require('../../fielddef');
var common_1 = require('../common');
var area;
(function (area) {
    function markType() {
        return 'area';
    }
    area.markType = markType;
    function properties(model) {
        var p = {};
        var orient = model.config().mark.orient;
        if (orient !== undefined) {
            p.orient = { value: orient };
        }
        var stack = model.stack();
        var xFieldDef = model.encoding().x;
        if (stack && channel_1.X === stack.fieldChannel) {
            p.x = {
                scale: model.scaleName(channel_1.X),
                field: model.field(channel_1.X, { suffix: '_start' })
            };
            if (orient === 'horizontal') {
                p.x2 = {
                    scale: model.scaleName(channel_1.X),
                    field: model.field(channel_1.X, { suffix: '_end' })
                };
            }
        }
        else if (fielddef_1.isMeasure(xFieldDef)) {
            if (orient === 'horizontal') {
                if (model.has(channel_1.X)) {
                    p.x = {
                        scale: model.scaleName(channel_1.X),
                        field: model.field(channel_1.X)
                    };
                }
                else {
                    p.x = {
                        scale: model.scaleName(channel_1.X),
                        value: 0
                    };
                }
                if (model.has(channel_1.X2)) {
                    p.x2 = {
                        scale: model.scaleName(channel_1.X),
                        field: model.field(channel_1.X2)
                    };
                }
                else {
                    p.x2 = {
                        scale: model.scaleName(channel_1.X),
                        value: 0
                    };
                }
            }
            else {
                p.x = {
                    scale: model.scaleName(channel_1.X),
                    field: model.field(channel_1.X)
                };
            }
        }
        else if (fielddef_1.isDimension(xFieldDef)) {
            p.x = {
                scale: model.scaleName(channel_1.X),
                field: model.field(channel_1.X, { binSuffix: '_mid' })
            };
        }
        var yFieldDef = model.encoding().y;
        if (stack && channel_1.Y === stack.fieldChannel) {
            p.y = {
                scale: model.scaleName(channel_1.Y),
                field: model.field(channel_1.Y, { suffix: '_start' })
            };
            if (orient !== 'horizontal') {
                p.y2 = {
                    scale: model.scaleName(channel_1.Y),
                    field: model.field(channel_1.Y, { suffix: '_end' })
                };
            }
        }
        else if (fielddef_1.isMeasure(yFieldDef)) {
            if (orient !== 'horizontal') {
                if (model.has(channel_1.Y)) {
                    p.y = {
                        scale: model.scaleName(channel_1.Y),
                        field: model.field(channel_1.Y)
                    };
                }
                else {
                    p.y = { field: { group: 'height' } };
                }
                if (model.has(channel_1.Y2)) {
                    p.y2 = {
                        scale: model.scaleName(channel_1.Y),
                        field: model.field(channel_1.Y2)
                    };
                }
                else {
                    p.y2 = {
                        scale: model.scaleName(channel_1.Y),
                        value: 0
                    };
                }
            }
            else {
                p.y = {
                    scale: model.scaleName(channel_1.Y),
                    field: model.field(channel_1.Y)
                };
            }
        }
        else if (fielddef_1.isDimension(yFieldDef)) {
            p.y = {
                scale: model.scaleName(channel_1.Y),
                field: model.field(channel_1.Y, { binSuffix: '_mid' })
            };
        }
        common_1.applyColorAndOpacity(p, model);
        common_1.applyMarkConfig(p, model, ['interpolate', 'tension']);
        return p;
    }
    area.properties = properties;
    function labels(model) {
        return undefined;
    }
    area.labels = labels;
})(area = exports.area || (exports.area = {}));

},{"../../channel":14,"../../fielddef":52,"../common":16}],37:[function(require,module,exports){
"use strict";
var channel_1 = require('../../channel');
var fielddef_1 = require('../../fielddef');
var common_1 = require('../common');
var bar;
(function (bar) {
    function markType() {
        return 'rect';
    }
    bar.markType = markType;
    function properties(model) {
        var p = {};
        var orient = model.config().mark.orient;
        var stack = model.stack();
        var xFieldDef = model.encoding().x;
        var x2FieldDef = model.encoding().x2;
        var xIsMeasure = fielddef_1.isMeasure(xFieldDef) || fielddef_1.isMeasure(x2FieldDef);
        if (stack && channel_1.X === stack.fieldChannel) {
            p.x = {
                scale: model.scaleName(channel_1.X),
                field: model.field(channel_1.X, { suffix: '_start' })
            };
            p.x2 = {
                scale: model.scaleName(channel_1.X),
                field: model.field(channel_1.X, { suffix: '_end' })
            };
        }
        else if (xIsMeasure) {
            if (orient === 'horizontal') {
                if (model.has(channel_1.X)) {
                    p.x = {
                        scale: model.scaleName(channel_1.X),
                        field: model.field(channel_1.X)
                    };
                }
                else {
                    p.x = {
                        scale: model.scaleName(channel_1.X),
                        value: 0
                    };
                }
                if (model.has(channel_1.X2)) {
                    p.x2 = {
                        scale: model.scaleName(channel_1.X),
                        field: model.field(channel_1.X2)
                    };
                }
                else {
                    p.x2 = {
                        scale: model.scaleName(channel_1.X),
                        value: 0
                    };
                }
            }
            else {
                p.xc = {
                    scale: model.scaleName(channel_1.X),
                    field: model.field(channel_1.X)
                };
                p.width = { value: sizeValue(model, channel_1.X) };
            }
        }
        else if (model.fieldDef(channel_1.X).bin) {
            if (model.has(channel_1.SIZE) && orient !== 'horizontal') {
                p.xc = {
                    scale: model.scaleName(channel_1.X),
                    field: model.field(channel_1.X, { binSuffix: '_mid' })
                };
                p.width = {
                    scale: model.scaleName(channel_1.SIZE),
                    field: model.field(channel_1.SIZE)
                };
            }
            else {
                p.x = {
                    scale: model.scaleName(channel_1.X),
                    field: model.field(channel_1.X, { binSuffix: '_start' }),
                    offset: 1
                };
                p.x2 = {
                    scale: model.scaleName(channel_1.X),
                    field: model.field(channel_1.X, { binSuffix: '_end' })
                };
            }
        }
        else {
            if (model.has(channel_1.X)) {
                p.xc = {
                    scale: model.scaleName(channel_1.X),
                    field: model.field(channel_1.X)
                };
            }
            else {
                p.x = { value: 0, offset: 2 };
            }
            p.width = model.has(channel_1.SIZE) && orient !== 'horizontal' ? {
                scale: model.scaleName(channel_1.SIZE),
                field: model.field(channel_1.SIZE)
            } : {
                value: sizeValue(model, (channel_1.X))
            };
        }
        var yFieldDef = model.encoding().y;
        var y2FieldDef = model.encoding().y2;
        var yIsMeasure = fielddef_1.isMeasure(yFieldDef) || fielddef_1.isMeasure(y2FieldDef);
        if (stack && channel_1.Y === stack.fieldChannel) {
            p.y = {
                scale: model.scaleName(channel_1.Y),
                field: model.field(channel_1.Y, { suffix: '_start' })
            };
            p.y2 = {
                scale: model.scaleName(channel_1.Y),
                field: model.field(channel_1.Y, { suffix: '_end' })
            };
        }
        else if (yIsMeasure) {
            if (orient !== 'horizontal') {
                if (model.has(channel_1.Y)) {
                    p.y = {
                        scale: model.scaleName(channel_1.Y),
                        field: model.field(channel_1.Y)
                    };
                }
                else {
                    p.y = {
                        scale: model.scaleName(channel_1.Y),
                        value: 0
                    };
                }
                if (model.has(channel_1.Y2)) {
                    p.y2 = {
                        scale: model.scaleName(channel_1.Y),
                        field: model.field(channel_1.Y2)
                    };
                }
                else {
                    p.y2 = {
                        scale: model.scaleName(channel_1.Y),
                        value: 0
                    };
                }
            }
            else {
                p.yc = {
                    scale: model.scaleName(channel_1.Y),
                    field: model.field(channel_1.Y)
                };
                p.height = { value: sizeValue(model, channel_1.Y) };
            }
        }
        else if (model.fieldDef(channel_1.Y).bin) {
            if (model.has(channel_1.SIZE) && orient === 'horizontal') {
                p.yc = {
                    scale: model.scaleName(channel_1.Y),
                    field: model.field(channel_1.Y, { binSuffix: '_mid' })
                };
                p.height = {
                    scale: model.scaleName(channel_1.SIZE),
                    field: model.field(channel_1.SIZE)
                };
            }
            else {
                p.y = {
                    scale: model.scaleName(channel_1.Y),
                    field: model.field(channel_1.Y, { binSuffix: '_start' })
                };
                p.y2 = {
                    scale: model.scaleName(channel_1.Y),
                    field: model.field(channel_1.Y, { binSuffix: '_end' }),
                    offset: 1
                };
            }
        }
        else {
            if (model.has(channel_1.Y)) {
                p.yc = {
                    scale: model.scaleName(channel_1.Y),
                    field: model.field(channel_1.Y)
                };
            }
            else {
                p.y2 = {
                    field: { group: 'height' },
                    offset: -1
                };
            }
            p.height = model.has(channel_1.SIZE) && orient === 'horizontal' ? {
                scale: model.scaleName(channel_1.SIZE),
                field: model.field(channel_1.SIZE)
            } : {
                value: sizeValue(model, channel_1.Y)
            };
        }
        common_1.applyColorAndOpacity(p, model);
        return p;
    }
    bar.properties = properties;
    function sizeValue(model, channel) {
        var fieldDef = model.fieldDef(channel_1.SIZE);
        if (fieldDef && fieldDef.value !== undefined) {
            return fieldDef.value;
        }
        var markConfig = model.config().mark;
        if (markConfig.barSize) {
            return markConfig.barSize;
        }
        return model.isOrdinalScale(channel) ?
            model.scale(channel).bandSize - 1 :
            !model.has(channel) ?
                model.config().scale.bandSize - 1 :
                markConfig.barThinSize;
    }
    function labels(model) {
        return undefined;
    }
    bar.labels = labels;
})(bar = exports.bar || (exports.bar = {}));

},{"../../channel":14,"../../fielddef":52,"../common":16}],38:[function(require,module,exports){
"use strict";
var channel_1 = require('../../channel');
var common_1 = require('../common');
var line;
(function (line) {
    function markType() {
        return 'line';
    }
    line.markType = markType;
    function properties(model) {
        var p = {};
        if (model.has(channel_1.X)) {
            p.x = {
                scale: model.scaleName(channel_1.X),
                field: model.field(channel_1.X, { binSuffix: '_mid' })
            };
        }
        else {
            p.x = { value: 0 };
        }
        if (model.has(channel_1.Y)) {
            p.y = {
                scale: model.scaleName(channel_1.Y),
                field: model.field(channel_1.Y, { binSuffix: '_mid' })
            };
        }
        else {
            p.y = { field: { group: 'height' } };
        }
        common_1.applyColorAndOpacity(p, model);
        common_1.applyMarkConfig(p, model, ['interpolate', 'tension']);
        var size = sizeValue(model);
        if (size) {
            p.strokeWidth = { value: size };
        }
        return p;
    }
    line.properties = properties;
    function sizeValue(model) {
        var fieldDef = model.fieldDef(channel_1.SIZE);
        if (fieldDef && fieldDef.value !== undefined) {
            return fieldDef.value;
        }
        return model.config().mark.lineSize;
    }
    function labels(model) {
        return undefined;
    }
    line.labels = labels;
})(line = exports.line || (exports.line = {}));

},{"../../channel":14,"../common":16}],39:[function(require,module,exports){
"use strict";
var channel_1 = require('../../channel');
var mark_1 = require('../../mark');
var stack_1 = require('../stack');
var util_1 = require('../../util');
var area_1 = require('./area');
var bar_1 = require('./bar');
var line_1 = require('./line');
var point_1 = require('./point');
var text_1 = require('./text');
var tick_1 = require('./tick');
var rule_1 = require('./rule');
var common_1 = require('../common');
var markCompiler = {
    area: area_1.area,
    bar: bar_1.bar,
    line: line_1.line,
    point: point_1.point,
    text: text_1.text,
    tick: tick_1.tick,
    rule: rule_1.rule,
    circle: point_1.circle,
    square: point_1.square
};
function parseMark(model) {
    if (util_1.contains([mark_1.LINE, mark_1.AREA], model.mark())) {
        return parsePathMark(model);
    }
    else {
        return parseNonPathMark(model);
    }
}
exports.parseMark = parseMark;
function parsePathMark(model) {
    var mark = model.mark();
    var isFaceted = model.parent() && model.parent().isFacet();
    var dataFrom = { data: model.dataTable() };
    var details = detailFields(model);
    var pathMarks = [
        {
            name: model.name('marks'),
            type: markCompiler[mark].markType(),
            from: util_1.extend(isFaceted || details.length > 0 ? {} : dataFrom, { transform: [{ type: 'sort', by: sortPathBy(model) }] }),
            properties: { update: markCompiler[mark].properties(model) }
        }
    ];
    if (details.length > 0) {
        var facetTransform = { type: 'facet', groupby: details };
        var transform = mark === mark_1.AREA && model.stack() ?
            [stack_1.imputeTransform(model), stack_1.stackTransform(model), facetTransform] :
            [].concat(facetTransform, model.has(channel_1.ORDER) ? [{ type: 'sort', by: sortBy(model) }] : []);
        return [{
                name: model.name('pathgroup'),
                type: 'group',
                from: util_1.extend(isFaceted ? {} : dataFrom, { transform: transform }),
                properties: {
                    update: {
                        width: { field: { group: 'width' } },
                        height: { field: { group: 'height' } }
                    }
                },
                marks: pathMarks
            }];
    }
    else {
        return pathMarks;
    }
}
function parseNonPathMark(model) {
    var mark = model.mark();
    var isFaceted = model.parent() && model.parent().isFacet();
    var dataFrom = { data: model.dataTable() };
    var marks = [];
    if (mark === mark_1.TEXT &&
        model.has(channel_1.COLOR) &&
        model.config().mark.applyColorToBackground && !model.has(channel_1.X) && !model.has(channel_1.Y)) {
        marks.push(util_1.extend({
            name: model.name('background'),
            type: 'rect'
        }, isFaceted ? {} : { from: dataFrom }, { properties: { update: text_1.text.background(model) } }));
    }
    marks.push(util_1.extend({
        name: model.name('marks'),
        type: markCompiler[mark].markType()
    }, (!isFaceted || model.stack() || model.has(channel_1.ORDER)) ? {
        from: util_1.extend(isFaceted ? {} : dataFrom, model.stack() ?
            { transform: [stack_1.stackTransform(model)] } :
            model.has(channel_1.ORDER) ?
                { transform: [{ type: 'sort', by: sortBy(model) }] } :
                {})
    } : {}, { properties: { update: markCompiler[mark].properties(model) } }));
    if (model.has(channel_1.LABEL) && markCompiler[mark].labels) {
        var labelProperties = markCompiler[mark].labels(model);
        if (labelProperties !== undefined) {
            marks.push(util_1.extend({
                name: model.name('label'),
                type: 'text'
            }, isFaceted ? {} : { from: dataFrom }, { properties: { update: labelProperties } }));
        }
    }
    return marks;
}
function sortBy(model) {
    if (model.has(channel_1.ORDER)) {
        var channelDef = model.encoding().order;
        if (channelDef instanceof Array) {
            return channelDef.map(common_1.sortField);
        }
        else {
            return common_1.sortField(channelDef);
        }
    }
    return null;
}
function sortPathBy(model) {
    if (model.mark() === mark_1.LINE && model.has(channel_1.PATH)) {
        var channelDef = model.encoding().path;
        if (channelDef instanceof Array) {
            return channelDef.map(common_1.sortField);
        }
        else {
            return common_1.sortField(channelDef);
        }
    }
    else {
        return '-' + model.field(model.config().mark.orient === 'horizontal' ? channel_1.Y : channel_1.X);
    }
}
function detailFields(model) {
    return [channel_1.COLOR, channel_1.DETAIL, channel_1.OPACITY, channel_1.SHAPE].reduce(function (details, channel) {
        if (model.has(channel) && !model.fieldDef(channel).aggregate) {
            details.push(model.field(channel));
        }
        return details;
    }, []);
}

},{"../../channel":14,"../../mark":54,"../../util":61,"../common":16,"../stack":46,"./area":36,"./bar":37,"./line":38,"./point":40,"./rule":41,"./text":42,"./tick":43}],40:[function(require,module,exports){
"use strict";
var channel_1 = require('../../channel');
var common_1 = require('../common');
var point;
(function (point) {
    function markType() {
        return 'symbol';
    }
    point.markType = markType;
    function properties(model, fixedShape) {
        var p = {};
        if (model.has(channel_1.X)) {
            p.x = {
                scale: model.scaleName(channel_1.X),
                field: model.field(channel_1.X, { binSuffix: '_mid' })
            };
        }
        else {
            p.x = { value: model.config().scale.bandSize / 2 };
        }
        if (model.has(channel_1.Y)) {
            p.y = {
                scale: model.scaleName(channel_1.Y),
                field: model.field(channel_1.Y, { binSuffix: '_mid' })
            };
        }
        else {
            p.y = { value: model.config().scale.bandSize / 2 };
        }
        if (model.has(channel_1.SIZE)) {
            p.size = {
                scale: model.scaleName(channel_1.SIZE),
                field: model.field(channel_1.SIZE)
            };
        }
        else {
            p.size = { value: sizeValue(model) };
        }
        if (fixedShape) {
            p.shape = { value: fixedShape };
        }
        else if (model.has(channel_1.SHAPE)) {
            p.shape = {
                scale: model.scaleName(channel_1.SHAPE),
                field: model.field(channel_1.SHAPE)
            };
        }
        else if (model.fieldDef(channel_1.SHAPE).value) {
            p.shape = { value: model.fieldDef(channel_1.SHAPE).value };
        }
        else if (model.config().mark.shape) {
            p.shape = { value: model.config().mark.shape };
        }
        common_1.applyColorAndOpacity(p, model);
        return p;
    }
    point.properties = properties;
    function sizeValue(model) {
        var fieldDef = model.fieldDef(channel_1.SIZE);
        if (fieldDef && fieldDef.value !== undefined) {
            return fieldDef.value;
        }
        return model.config().mark.size;
    }
    function labels(model) {
    }
    point.labels = labels;
})(point = exports.point || (exports.point = {}));
var circle;
(function (circle) {
    function markType() {
        return 'symbol';
    }
    circle.markType = markType;
    function properties(model) {
        return point.properties(model, 'circle');
    }
    circle.properties = properties;
    function labels(model) {
        return undefined;
    }
    circle.labels = labels;
})(circle = exports.circle || (exports.circle = {}));
var square;
(function (square) {
    function markType() {
        return 'symbol';
    }
    square.markType = markType;
    function properties(model) {
        return point.properties(model, 'square');
    }
    square.properties = properties;
    function labels(model) {
        return undefined;
    }
    square.labels = labels;
})(square = exports.square || (exports.square = {}));

},{"../../channel":14,"../common":16}],41:[function(require,module,exports){
"use strict";
var channel_1 = require('../../channel');
var common_1 = require('../common');
var rule;
(function (rule) {
    function markType() {
        return 'rule';
    }
    rule.markType = markType;
    function properties(model) {
        var p = {};
        if (model.config().mark.orient === 'vertical') {
            if (model.has(channel_1.X)) {
                p.x = {
                    scale: model.scaleName(channel_1.X),
                    field: model.field(channel_1.X, { binSuffix: '_mid' })
                };
            }
            else {
                p.x = { value: 0 };
            }
            if (model.has(channel_1.Y)) {
                p.y = {
                    scale: model.scaleName(channel_1.Y),
                    field: model.field(channel_1.Y, { binSuffix: '_mid' })
                };
            }
            else {
                p.y = { field: { group: 'height' } };
            }
            if (model.has(channel_1.Y2)) {
                p.y2 = {
                    scale: model.scaleName(channel_1.Y),
                    field: model.field(channel_1.Y2, { binSuffix: '_mid' })
                };
            }
            else {
                p.y2 = { value: 0 };
            }
        }
        else {
            if (model.has(channel_1.Y)) {
                p.y = {
                    scale: model.scaleName(channel_1.Y),
                    field: model.field(channel_1.Y, { binSuffix: '_mid' })
                };
            }
            else {
                p.y = { value: 0 };
            }
            if (model.has(channel_1.X)) {
                p.x = {
                    scale: model.scaleName(channel_1.X),
                    field: model.field(channel_1.X, { binSuffix: '_mid' })
                };
            }
            else {
                p.x = { value: 0 };
            }
            if (model.has(channel_1.X2)) {
                p.x2 = {
                    scale: model.scaleName(channel_1.X),
                    field: model.field(channel_1.X2, { binSuffix: '_mid' })
                };
            }
            else {
                p.x2 = { field: { group: 'width' } };
            }
        }
        common_1.applyColorAndOpacity(p, model);
        if (model.has(channel_1.SIZE)) {
            p.strokeWidth = {
                scale: model.scaleName(channel_1.SIZE),
                field: model.field(channel_1.SIZE)
            };
        }
        else {
            p.strokeWidth = { value: sizeValue(model) };
        }
        return p;
    }
    rule.properties = properties;
    function sizeValue(model) {
        var fieldDef = model.fieldDef(channel_1.SIZE);
        if (fieldDef && fieldDef.value !== undefined) {
            return fieldDef.value;
        }
        return model.config().mark.ruleSize;
    }
    function labels(model) {
        return undefined;
    }
    rule.labels = labels;
})(rule = exports.rule || (exports.rule = {}));

},{"../../channel":14,"../common":16}],42:[function(require,module,exports){
"use strict";
var channel_1 = require('../../channel');
var common_1 = require('../common');
var util_1 = require('../../util');
var type_1 = require('../../type');
var text;
(function (text) {
    function markType() {
        return 'text';
    }
    text.markType = markType;
    function background(model) {
        return {
            x: { value: 0 },
            y: { value: 0 },
            width: { field: { group: 'width' } },
            height: { field: { group: 'height' } },
            fill: {
                scale: model.scaleName(channel_1.COLOR),
                field: model.field(channel_1.COLOR, model.fieldDef(channel_1.COLOR).type === type_1.ORDINAL ? { prefn: 'rank_' } : {})
            }
        };
    }
    text.background = background;
    function properties(model) {
        var p = {};
        common_1.applyMarkConfig(p, model, ['angle', 'align', 'baseline', 'dx', 'dy', 'font', 'fontWeight',
            'fontStyle', 'radius', 'theta', 'text']);
        var fieldDef = model.fieldDef(channel_1.TEXT);
        if (model.has(channel_1.X)) {
            p.x = {
                scale: model.scaleName(channel_1.X),
                field: model.field(channel_1.X, { binSuffix: '_mid' })
            };
        }
        else {
            if (model.has(channel_1.TEXT) && model.fieldDef(channel_1.TEXT).type === type_1.QUANTITATIVE) {
                p.x = { field: { group: 'width' }, offset: -5 };
            }
            else {
                p.x = { value: model.config().scale.textBandWidth / 2 };
            }
        }
        if (model.has(channel_1.Y)) {
            p.y = {
                scale: model.scaleName(channel_1.Y),
                field: model.field(channel_1.Y, { binSuffix: '_mid' })
            };
        }
        else {
            p.y = { value: model.config().scale.bandSize / 2 };
        }
        if (model.has(channel_1.SIZE)) {
            p.fontSize = {
                scale: model.scaleName(channel_1.SIZE),
                field: model.field(channel_1.SIZE)
            };
        }
        else {
            p.fontSize = { value: sizeValue(model) };
        }
        if (model.config().mark.applyColorToBackground && !model.has(channel_1.X) && !model.has(channel_1.Y)) {
            p.fill = { value: 'black' };
            var opacity = model.config().mark.opacity;
            if (opacity) {
                p.opacity = { value: opacity };
            }
            ;
        }
        else {
            common_1.applyColorAndOpacity(p, model);
        }
        if (model.has(channel_1.TEXT)) {
            if (util_1.contains([type_1.QUANTITATIVE, type_1.TEMPORAL], model.fieldDef(channel_1.TEXT).type)) {
                var def = common_1.formatMixins(model, fieldDef, model.config().mark.format, model.config().mark.shortTimeLabels);
                util_1.extend(p, formatMixinsText(model, def));
            }
            else {
                p.text = { field: model.field(channel_1.TEXT) };
            }
        }
        else if (fieldDef.value) {
            p.text = { value: fieldDef.value };
        }
        return p;
    }
    text.properties = properties;
    function sizeValue(model) {
        var fieldDef = model.fieldDef(channel_1.SIZE);
        if (fieldDef && fieldDef.value !== undefined) {
            return fieldDef.value;
        }
        return model.config().mark.fontSize;
    }
    function formatMixinsText(model, def) {
        var filter = (def.formatType || 'number') + (def.format ? ':\'' + def.format + '\'' : '');
        return {
            text: {
                template: '{{' + model.field(channel_1.TEXT, { datum: true }) + ' | ' + filter + '}}'
            }
        };
    }
})(text = exports.text || (exports.text = {}));

},{"../../channel":14,"../../type":60,"../../util":61,"../common":16}],43:[function(require,module,exports){
"use strict";
var channel_1 = require('../../channel');
var common_1 = require('../common');
var tick;
(function (tick) {
    function markType() {
        return 'rect';
    }
    tick.markType = markType;
    function properties(model) {
        var p = {};
        if (model.has(channel_1.X)) {
            p.xc = {
                scale: model.scaleName(channel_1.X),
                field: model.field(channel_1.X, { binSuffix: '_mid' })
            };
        }
        else {
            p.xc = { value: model.config().scale.bandSize / 2 };
        }
        if (model.has(channel_1.Y)) {
            p.yc = {
                scale: model.scaleName(channel_1.Y),
                field: model.field(channel_1.Y, { binSuffix: '_mid' })
            };
        }
        else {
            p.yc = { value: model.config().scale.bandSize / 2 };
        }
        if (model.config().mark.orient === 'horizontal') {
            p.width = model.has(channel_1.SIZE) ? {
                scale: model.scaleName(channel_1.SIZE),
                field: model.field(channel_1.SIZE)
            } : {
                value: sizeValue(model, channel_1.X)
            };
            p.height = { value: model.config().mark.tickThickness };
        }
        else {
            p.width = { value: model.config().mark.tickThickness };
            p.height = model.has(channel_1.SIZE) ? {
                scale: model.scaleName(channel_1.SIZE),
                field: model.field(channel_1.SIZE)
            } : {
                value: sizeValue(model, channel_1.Y)
            };
        }
        common_1.applyColorAndOpacity(p, model);
        return p;
    }
    tick.properties = properties;
    function sizeValue(model, channel) {
        var fieldDef = model.fieldDef(channel_1.SIZE);
        if (fieldDef && fieldDef.value !== undefined) {
            return fieldDef.value;
        }
        var scaleConfig = model.config().scale;
        var markConfig = model.config().mark;
        if (markConfig.tickSize) {
            return markConfig.tickSize;
        }
        var bandSize = model.has(channel) ?
            model.scale(channel).bandSize :
            scaleConfig.bandSize;
        return bandSize / 1.5;
    }
    function labels(model) {
        return undefined;
    }
    tick.labels = labels;
})(tick = exports.tick || (exports.tick = {}));

},{"../../channel":14,"../common":16}],44:[function(require,module,exports){
"use strict";
var channel_1 = require('../channel');
var encoding_1 = require('../encoding');
var fielddef_1 = require('../fielddef');
var scale_1 = require('../scale');
var util_1 = require('../util');
var NameMap = (function () {
    function NameMap() {
        this._nameMap = {};
    }
    NameMap.prototype.rename = function (oldName, newName) {
        this._nameMap[oldName] = newName;
    };
    NameMap.prototype.get = function (name) {
        while (this._nameMap[name]) {
            name = this._nameMap[name];
        }
        return name;
    };
    return NameMap;
}());
var Model = (function () {
    function Model(spec, parent, parentGivenName) {
        this._warnings = [];
        this._parent = parent;
        this._name = spec.name || parentGivenName;
        this._dataNameMap = parent ? parent._dataNameMap : new NameMap();
        this._scaleNameMap = parent ? parent._scaleNameMap : new NameMap();
        this._sizeNameMap = parent ? parent._sizeNameMap : new NameMap();
        this._data = spec.data;
        this._description = spec.description;
        this._transform = spec.transform;
        this.component = { data: null, layout: null, mark: null, scale: null, axis: null, axisGroup: null, gridGroup: null, legend: null };
    }
    Model.prototype.parse = function () {
        this.parseData();
        this.parseSelectionData();
        this.parseLayoutData();
        this.parseScale();
        this.parseAxis();
        this.parseLegend();
        this.parseAxisGroup();
        this.parseGridGroup();
        this.parseMark();
    };
    Model.prototype.assembleScales = function () {
        return util_1.flatten(util_1.vals(this.component.scale).map(function (scales) {
            var arr = [scales.main];
            if (scales.colorLegend) {
                arr.push(scales.colorLegend);
            }
            if (scales.binColorLegend) {
                arr.push(scales.binColorLegend);
            }
            return arr;
        }));
    };
    Model.prototype.assembleAxes = function () {
        return util_1.vals(this.component.axis);
    };
    Model.prototype.assembleLegends = function () {
        return util_1.vals(this.component.legend);
    };
    Model.prototype.assembleGroup = function () {
        var group = {};
        group.marks = this.assembleMarks();
        var scales = this.assembleScales();
        if (scales.length > 0) {
            group.scales = scales;
        }
        var axes = this.assembleAxes();
        if (axes.length > 0) {
            group.axes = axes;
        }
        var legends = this.assembleLegends();
        if (legends.length > 0) {
            group.legends = legends;
        }
        return group;
    };
    Model.prototype.reduce = function (f, init, t) {
        return encoding_1.channelMappingReduce(this.channels(), this.mapping(), f, init, t);
    };
    Model.prototype.forEach = function (f, t) {
        encoding_1.channelMappingForEach(this.channels(), this.mapping(), f, t);
    };
    Model.prototype.parent = function () {
        return this._parent;
    };
    Model.prototype.name = function (text, delimiter) {
        if (delimiter === void 0) { delimiter = '_'; }
        return (this._name ? this._name + delimiter : '') + text;
    };
    Model.prototype.description = function () {
        return this._description;
    };
    Model.prototype.data = function () {
        return this._data;
    };
    Model.prototype.renameData = function (oldName, newName) {
        this._dataNameMap.rename(oldName, newName);
    };
    Model.prototype.dataName = function (dataSourceType) {
        return this._dataNameMap.get(this.name(String(dataSourceType)));
    };
    Model.prototype.renameSize = function (oldName, newName) {
        this._sizeNameMap.rename(oldName, newName);
    };
    Model.prototype.channelSizeName = function (channel) {
        return this.sizeName(channel === channel_1.X || channel === channel_1.COLUMN ? 'width' : 'height');
    };
    Model.prototype.sizeName = function (size) {
        return this._sizeNameMap.get(this.name(size, '_'));
    };
    Model.prototype.transform = function () {
        return this._transform || {};
    };
    Model.prototype.field = function (channel, opt) {
        if (opt === void 0) { opt = {}; }
        var fieldDef = this.fieldDef(channel);
        if (fieldDef.bin) {
            opt = util_1.extend({
                binSuffix: this.scale(channel).type === scale_1.ScaleType.ORDINAL ? '_range' : '_start'
            }, opt);
        }
        return fielddef_1.field(fieldDef, opt);
    };
    Model.prototype.scale = function (channel) {
        return this._scale[channel];
    };
    Model.prototype.isOrdinalScale = function (channel) {
        var scale = this.scale(channel);
        return scale && scale.type === scale_1.ScaleType.ORDINAL;
    };
    Model.prototype.renameScale = function (oldName, newName) {
        this._scaleNameMap.rename(oldName, newName);
    };
    Model.prototype.scaleName = function (channel) {
        return this._scaleNameMap.get(this.name(channel + ''));
    };
    Model.prototype.sort = function (channel) {
        return (this.mapping()[channel] || {}).sort;
    };
    Model.prototype.axis = function (channel) {
        return this._axis[channel];
    };
    Model.prototype.legend = function (channel) {
        return this._legend[channel];
    };
    Model.prototype.config = function () {
        return this._config;
    };
    Model.prototype.addWarning = function (message) {
        util_1.warning(message);
        this._warnings.push(message);
    };
    Model.prototype.warnings = function () {
        return this._warnings;
    };
    Model.prototype.isUnit = function () {
        return false;
    };
    Model.prototype.isFacet = function () {
        return false;
    };
    Model.prototype.isLayer = function () {
        return false;
    };
    return Model;
}());
exports.Model = Model;

},{"../channel":14,"../encoding":51,"../fielddef":52,"../scale":55,"../util":61}],45:[function(require,module,exports){
"use strict";
var aggregate_1 = require('../aggregate');
var channel_1 = require('../channel');
var config_1 = require('../config');
var data_1 = require('../data');
var fielddef_1 = require('../fielddef');
var mark_1 = require('../mark');
var scale_1 = require('../scale');
var timeunit_1 = require('../timeunit');
var type_1 = require('../type');
var util_1 = require('../util');
var time_1 = require('./time');
exports.COLOR_LEGEND = 'color_legend';
exports.COLOR_LEGEND_LABEL = 'color_legend_label';
function parseScaleComponent(model) {
    return model.channels().reduce(function (scale, channel) {
        if (model.scale(channel)) {
            var fieldDef = model.fieldDef(channel);
            var scales = {
                main: parseMainScale(model, fieldDef, channel)
            };
            if (channel === channel_1.COLOR && model.legend(channel_1.COLOR) && (fieldDef.type === type_1.ORDINAL || fieldDef.bin || fieldDef.timeUnit)) {
                scales.colorLegend = parseColorLegendScale(model, fieldDef);
                if (fieldDef.bin) {
                    scales.binColorLegend = parseBinColorLegendLabel(model, fieldDef);
                }
            }
            scale[channel] = scales;
        }
        return scale;
    }, {});
}
exports.parseScaleComponent = parseScaleComponent;
function parseMainScale(model, fieldDef, channel) {
    var scale = model.scale(channel);
    var sort = model.sort(channel);
    var scaleDef = {
        name: model.scaleName(channel),
        type: scale.type,
    };
    if (channel === channel_1.X && model.has(channel_1.X2)) {
        if (model.has(channel_1.X)) {
            scaleDef.domain = { fields: [domain(scale, model, channel_1.X), domain(scale, model, channel_1.X2)] };
        }
        else {
            scaleDef.domain = domain(scale, model, channel_1.X2);
        }
    }
    else if (channel === channel_1.Y && model.has(channel_1.Y2)) {
        if (model.has(channel_1.Y)) {
            scaleDef.domain = { fields: [domain(scale, model, channel_1.Y), domain(scale, model, channel_1.Y2)] };
        }
        else {
            scaleDef.domain = domain(scale, model, channel_1.Y2);
        }
    }
    else {
        scaleDef.domain = domain(scale, model, channel);
    }
    util_1.extend(scaleDef, rangeMixins(scale, model, channel));
    if (sort && (typeof sort === 'string' ? sort : sort.order) === 'descending') {
        scaleDef.reverse = true;
    }
    [
        'round',
        'clamp', 'nice',
        'exponent', 'zero',
        'padding', 'points'
    ].forEach(function (property) {
        var value = exports[property](scale, channel, fieldDef, model);
        if (value !== undefined) {
            scaleDef[property] = value;
        }
    });
    return scaleDef;
}
function parseColorLegendScale(model, fieldDef) {
    return {
        name: model.scaleName(exports.COLOR_LEGEND),
        type: scale_1.ScaleType.ORDINAL,
        domain: {
            data: model.dataTable(),
            field: model.field(channel_1.COLOR, (fieldDef.bin || fieldDef.timeUnit) ? {} : { prefn: 'rank_' }),
            sort: true
        },
        range: { data: model.dataTable(), field: model.field(channel_1.COLOR), sort: true }
    };
}
function parseBinColorLegendLabel(model, fieldDef) {
    return {
        name: model.scaleName(exports.COLOR_LEGEND_LABEL),
        type: scale_1.ScaleType.ORDINAL,
        domain: {
            data: model.dataTable(),
            field: model.field(channel_1.COLOR),
            sort: true
        },
        range: {
            data: model.dataTable(),
            field: fielddef_1.field(fieldDef, { binSuffix: '_range' }),
            sort: {
                field: model.field(channel_1.COLOR, { binSuffix: '_start' }),
                op: 'min'
            }
        }
    };
}
function scaleType(scale, fieldDef, channel, mark) {
    if (!channel_1.hasScale(channel)) {
        return null;
    }
    if (util_1.contains([channel_1.ROW, channel_1.COLUMN, channel_1.SHAPE], channel)) {
        return scale_1.ScaleType.ORDINAL;
    }
    if (scale.type !== undefined) {
        return scale.type;
    }
    switch (fieldDef.type) {
        case type_1.NOMINAL:
            return scale_1.ScaleType.ORDINAL;
        case type_1.ORDINAL:
            if (channel === channel_1.COLOR) {
                return scale_1.ScaleType.LINEAR;
            }
            return scale_1.ScaleType.ORDINAL;
        case type_1.TEMPORAL:
            if (channel === channel_1.COLOR) {
                return scale_1.ScaleType.TIME;
            }
            if (fieldDef.timeUnit) {
                switch (fieldDef.timeUnit) {
                    case timeunit_1.TimeUnit.HOURS:
                    case timeunit_1.TimeUnit.DAY:
                    case timeunit_1.TimeUnit.MONTH:
                        return scale_1.ScaleType.ORDINAL;
                    default:
                        return scale_1.ScaleType.TIME;
                }
            }
            return scale_1.ScaleType.TIME;
        case type_1.QUANTITATIVE:
            if (fieldDef.bin) {
                return util_1.contains([channel_1.X, channel_1.Y, channel_1.COLOR], channel) ? scale_1.ScaleType.LINEAR : scale_1.ScaleType.ORDINAL;
            }
            return scale_1.ScaleType.LINEAR;
    }
    return null;
}
exports.scaleType = scaleType;
function domain(scale, model, channel) {
    var fieldDef = model.fieldDef(channel);
    if (scale.domain) {
        return scale.domain;
    }
    if (fieldDef.type === type_1.TEMPORAL) {
        if (time_1.rawDomain(fieldDef.timeUnit, channel)) {
            return {
                data: fieldDef.timeUnit,
                field: 'date'
            };
        }
        return {
            data: model.dataTable(),
            field: model.field(channel),
            sort: {
                field: model.field(channel),
                op: 'min'
            }
        };
    }
    var stack = model.stack();
    if (stack && channel === stack.fieldChannel) {
        if (stack.offset === config_1.StackOffset.NORMALIZE) {
            return [0, 1];
        }
        return {
            data: model.dataName(data_1.STACKED_SCALE),
            field: model.field(channel, { prefn: 'sum_' })
        };
    }
    var useRawDomain = _useRawDomain(scale, model, channel), sort = domainSort(model, channel, scale.type);
    if (useRawDomain) {
        return {
            data: data_1.SOURCE,
            field: model.field(channel, { noAggregate: true })
        };
    }
    else if (fieldDef.bin) {
        if (scale.type === scale_1.ScaleType.ORDINAL) {
            return {
                data: model.dataTable(),
                field: model.field(channel, { binSuffix: '_range' }),
                sort: {
                    field: model.field(channel, { binSuffix: '_start' }),
                    op: 'min'
                }
            };
        }
        else if (channel === channel_1.COLOR) {
            return {
                data: model.dataTable(),
                field: model.field(channel, { binSuffix: '_start' })
            };
        }
        else {
            return {
                data: model.dataTable(),
                field: [
                    model.field(channel, { binSuffix: '_start' }),
                    model.field(channel, { binSuffix: '_end' })
                ]
            };
        }
    }
    else if (sort) {
        return {
            data: sort.op ? data_1.SOURCE : model.dataTable(),
            field: (fieldDef.type === type_1.ORDINAL && channel === channel_1.COLOR) ? model.field(channel, { prefn: 'rank_' }) : model.field(channel),
            sort: sort
        };
    }
    else {
        return {
            data: model.dataTable(),
            field: (fieldDef.type === type_1.ORDINAL && channel === channel_1.COLOR) ? model.field(channel, { prefn: 'rank_' }) : model.field(channel),
        };
    }
}
exports.domain = domain;
function domainSort(model, channel, scaleType) {
    if (scaleType !== scale_1.ScaleType.ORDINAL) {
        return undefined;
    }
    var sort = model.sort(channel);
    if (util_1.contains(['ascending', 'descending', undefined], sort)) {
        return true;
    }
    if (typeof sort !== 'string') {
        return {
            op: sort.op,
            field: sort.field
        };
    }
    return undefined;
}
exports.domainSort = domainSort;
function _useRawDomain(scale, model, channel) {
    var fieldDef = model.fieldDef(channel);
    return scale.useRawDomain &&
        fieldDef.aggregate &&
        aggregate_1.SHARED_DOMAIN_OPS.indexOf(fieldDef.aggregate) >= 0 &&
        ((fieldDef.type === type_1.QUANTITATIVE && !fieldDef.bin) ||
            (fieldDef.type === type_1.TEMPORAL && util_1.contains([scale_1.ScaleType.TIME, scale_1.ScaleType.UTC], scale.type)));
}
function rangeMixins(scale, model, channel) {
    var fieldDef = model.fieldDef(channel);
    var scaleConfig = model.config().scale;
    if (scale.type === scale_1.ScaleType.ORDINAL && scale.bandSize && util_1.contains([channel_1.X, channel_1.Y], channel)) {
        return { bandSize: scale.bandSize };
    }
    if (scale.range && !util_1.contains([channel_1.X, channel_1.Y, channel_1.ROW, channel_1.COLUMN], channel)) {
        return { range: scale.range };
    }
    switch (channel) {
        case channel_1.ROW:
            return { range: 'height' };
        case channel_1.COLUMN:
            return { range: 'width' };
    }
    var unitModel = model;
    switch (channel) {
        case channel_1.X:
            return {
                rangeMin: 0,
                rangeMax: unitModel.config().cell.width
            };
        case channel_1.Y:
            return {
                rangeMin: unitModel.config().cell.height,
                rangeMax: 0
            };
        case channel_1.SIZE:
            if (unitModel.mark() === mark_1.BAR) {
                if (scaleConfig.barSizeRange !== undefined) {
                    return { range: scaleConfig.barSizeRange };
                }
                var dimension = model.config().mark.orient === 'horizontal' ? channel_1.Y : channel_1.X;
                return { range: [model.config().mark.barThinSize, model.scale(dimension).bandSize] };
            }
            else if (unitModel.mark() === mark_1.TEXT) {
                return { range: scaleConfig.fontSizeRange };
            }
            else if (unitModel.mark() === mark_1.RULE) {
                return { range: scaleConfig.ruleSizeRange };
            }
            else if (unitModel.mark() === mark_1.TICK) {
                return { range: scaleConfig.tickSizeRange };
            }
            if (scaleConfig.pointSizeRange !== undefined) {
                return { range: scaleConfig.pointSizeRange };
            }
            var bandSize = pointBandSize(unitModel);
            return { range: [9, (bandSize - 2) * (bandSize - 2)] };
        case channel_1.SHAPE:
            return { range: scaleConfig.shapeRange };
        case channel_1.COLOR:
            if (fieldDef.type === type_1.NOMINAL) {
                return { range: scaleConfig.nominalColorRange };
            }
            return { range: scaleConfig.sequentialColorRange };
        case channel_1.OPACITY:
            return { range: scaleConfig.opacity };
    }
    return {};
}
exports.rangeMixins = rangeMixins;
function pointBandSize(model) {
    var scaleConfig = model.config().scale;
    var hasX = model.has(channel_1.X);
    var hasY = model.has(channel_1.Y);
    var xIsMeasure = fielddef_1.isMeasure(model.encoding().x);
    var yIsMeasure = fielddef_1.isMeasure(model.encoding().y);
    if (hasX && hasY) {
        return xIsMeasure !== yIsMeasure ?
            model.scale(xIsMeasure ? channel_1.Y : channel_1.X).bandSize :
            Math.min(model.scale(channel_1.X).bandSize || scaleConfig.bandSize, model.scale(channel_1.Y).bandSize || scaleConfig.bandSize);
    }
    else if (hasY) {
        return yIsMeasure ? model.config().scale.bandSize : model.scale(channel_1.Y).bandSize;
    }
    else if (hasX) {
        return xIsMeasure ? model.config().scale.bandSize : model.scale(channel_1.X).bandSize;
    }
    return model.config().scale.bandSize;
}
function clamp(scale) {
    if (util_1.contains([scale_1.ScaleType.LINEAR, scale_1.ScaleType.POW, scale_1.ScaleType.SQRT,
        scale_1.ScaleType.LOG, scale_1.ScaleType.TIME, scale_1.ScaleType.UTC], scale.type)) {
        return scale.clamp;
    }
    return undefined;
}
exports.clamp = clamp;
function exponent(scale) {
    if (scale.type === scale_1.ScaleType.POW) {
        return scale.exponent;
    }
    return undefined;
}
exports.exponent = exponent;
function nice(scale, channel, fieldDef) {
    if (util_1.contains([scale_1.ScaleType.LINEAR, scale_1.ScaleType.POW, scale_1.ScaleType.SQRT, scale_1.ScaleType.LOG,
        scale_1.ScaleType.TIME, scale_1.ScaleType.UTC, scale_1.ScaleType.QUANTIZE], scale.type)) {
        if (scale.nice !== undefined) {
            return scale.nice;
        }
        if (util_1.contains([scale_1.ScaleType.TIME, scale_1.ScaleType.UTC], scale.type)) {
            return time_1.smallestUnit(fieldDef.timeUnit);
        }
        return util_1.contains([channel_1.X, channel_1.Y], channel);
    }
    return undefined;
}
exports.nice = nice;
function padding(scale, channel) {
    if (scale.type === scale_1.ScaleType.ORDINAL && util_1.contains([channel_1.X, channel_1.Y], channel)) {
        return scale.padding;
    }
    return undefined;
}
exports.padding = padding;
function points(scale, channel, __, model) {
    if (scale.type === scale_1.ScaleType.ORDINAL && util_1.contains([channel_1.X, channel_1.Y], channel)) {
        return true;
    }
    return undefined;
}
exports.points = points;
function round(scale, channel) {
    if (util_1.contains([channel_1.X, channel_1.Y, channel_1.ROW, channel_1.COLUMN, channel_1.SIZE], channel) && scale.round !== undefined) {
        return scale.round;
    }
    return undefined;
}
exports.round = round;
function zero(scale, channel, fieldDef) {
    if (!util_1.contains([scale_1.ScaleType.TIME, scale_1.ScaleType.UTC, scale_1.ScaleType.ORDINAL], scale.type)) {
        if (scale.zero !== undefined) {
            return scale.zero;
        }
        return !fieldDef.bin && util_1.contains([channel_1.X, channel_1.Y], channel);
    }
    return undefined;
}
exports.zero = zero;

},{"../aggregate":11,"../channel":14,"../config":49,"../data":50,"../fielddef":52,"../mark":54,"../scale":55,"../timeunit":59,"../type":60,"../util":61,"./time":47}],46:[function(require,module,exports){
"use strict";
var channel_1 = require('../channel');
var scale_1 = require('../scale');
var config_1 = require('../config');
var mark_1 = require('../mark');
var fielddef_1 = require('../fielddef');
var encoding_1 = require('../encoding');
var util_1 = require('../util');
var common_1 = require('./common');
function compileStackProperties(mark, encoding, scale, config) {
    var stackFields = getStackFields(mark, encoding, scale);
    if (stackFields.length > 0 &&
        util_1.contains([mark_1.BAR, mark_1.AREA], mark) &&
        config.mark.stacked !== config_1.StackOffset.NONE &&
        encoding_1.isAggregate(encoding) && !encoding_1.isRanged(encoding)) {
        var isXMeasure = encoding_1.has(encoding, channel_1.X) && fielddef_1.isMeasure(encoding.x), isYMeasure = encoding_1.has(encoding, channel_1.Y) && fielddef_1.isMeasure(encoding.y);
        if (isXMeasure && !isYMeasure) {
            return {
                groupbyChannel: channel_1.Y,
                fieldChannel: channel_1.X,
                stackFields: stackFields,
                offset: config.mark.stacked
            };
        }
        else if (isYMeasure && !isXMeasure) {
            return {
                groupbyChannel: channel_1.X,
                fieldChannel: channel_1.Y,
                stackFields: stackFields,
                offset: config.mark.stacked
            };
        }
    }
    return null;
}
exports.compileStackProperties = compileStackProperties;
function getStackFields(mark, encoding, scaleMap) {
    return [channel_1.COLOR, channel_1.DETAIL, channel_1.OPACITY, channel_1.SIZE].reduce(function (fields, channel) {
        var channelEncoding = encoding[channel];
        if (encoding_1.has(encoding, channel)) {
            if (util_1.isArray(channelEncoding)) {
                channelEncoding.forEach(function (fieldDef) {
                    fields.push(fielddef_1.field(fieldDef));
                });
            }
            else {
                var fieldDef = channelEncoding;
                var scale = scaleMap[channel];
                fields.push(fielddef_1.field(fieldDef, {
                    binSuffix: scale && scale.type === scale_1.ScaleType.ORDINAL ? '_range' : '_start'
                }));
            }
        }
        return fields;
    }, []);
}
function imputeTransform(model) {
    var stack = model.stack();
    return {
        type: 'impute',
        field: model.field(stack.fieldChannel),
        groupby: stack.stackFields,
        orderby: [model.field(stack.groupbyChannel)],
        method: 'value',
        value: 0
    };
}
exports.imputeTransform = imputeTransform;
function stackTransform(model) {
    var stack = model.stack();
    var encoding = model.encoding();
    var sortby = model.has(channel_1.ORDER) ?
        (util_1.isArray(encoding[channel_1.ORDER]) ? encoding[channel_1.ORDER] : [encoding[channel_1.ORDER]]).map(common_1.sortField) :
        stack.stackFields.map(function (field) {
            return '-' + field;
        });
    var valName = model.field(stack.fieldChannel);
    var transform = {
        type: 'stack',
        groupby: [model.field(stack.groupbyChannel)],
        field: model.field(stack.fieldChannel),
        sortby: sortby,
        output: {
            start: valName + '_start',
            end: valName + '_end'
        }
    };
    if (stack.offset) {
        transform.offset = stack.offset;
    }
    return transform;
}
exports.stackTransform = stackTransform;

},{"../channel":14,"../config":49,"../encoding":51,"../fielddef":52,"../mark":54,"../scale":55,"../util":61,"./common":16}],47:[function(require,module,exports){
"use strict";
var util_1 = require('../util');
var channel_1 = require('../channel');
var timeunit_1 = require('../timeunit');
function smallestUnit(timeUnit) {
    if (!timeUnit) {
        return undefined;
    }
    if (timeUnit.indexOf('second') > -1) {
        return 'second';
    }
    if (timeUnit.indexOf('minute') > -1) {
        return 'minute';
    }
    if (timeUnit.indexOf('hour') > -1) {
        return 'hour';
    }
    if (timeUnit.indexOf('day') > -1 || timeUnit.indexOf('date') > -1) {
        return 'day';
    }
    if (timeUnit.indexOf('month') > -1) {
        return 'month';
    }
    if (timeUnit.indexOf('year') > -1) {
        return 'year';
    }
    return undefined;
}
exports.smallestUnit = smallestUnit;
function parseExpression(timeUnit, fieldRef, onlyRef) {
    if (onlyRef === void 0) { onlyRef = false; }
    var out = 'datetime(';
    var timeString = timeUnit.toString();
    function get(fun, addComma) {
        if (addComma === void 0) { addComma = true; }
        if (onlyRef) {
            return fieldRef + (addComma ? ', ' : '');
        }
        else {
            return fun + '(' + fieldRef + ')' + (addComma ? ', ' : '');
        }
    }
    if (timeString.indexOf('year') > -1) {
        out += get('year');
    }
    else {
        out += '2006, ';
    }
    if (timeString.indexOf('month') > -1) {
        out += get('month');
    }
    else {
        out += '0, ';
    }
    if (timeString.indexOf('day') > -1) {
        out += get('day', false) + '+1, ';
    }
    else if (timeString.indexOf('date') > -1) {
        out += get('date');
    }
    else {
        out += '1, ';
    }
    if (timeString.indexOf('hours') > -1) {
        out += get('hours');
    }
    else {
        out += '0, ';
    }
    if (timeString.indexOf('minutes') > -1) {
        out += get('minutes');
    }
    else {
        out += '0, ';
    }
    if (timeString.indexOf('seconds') > -1) {
        out += get('seconds');
    }
    else {
        out += '0, ';
    }
    if (timeString.indexOf('milliseconds') > -1) {
        out += get('milliseconds', false);
    }
    else {
        out += '0';
    }
    return out + ')';
}
exports.parseExpression = parseExpression;
function rawDomain(timeUnit, channel) {
    if (util_1.contains([channel_1.ROW, channel_1.COLUMN, channel_1.SHAPE, channel_1.COLOR], channel)) {
        return null;
    }
    switch (timeUnit) {
        case timeunit_1.TimeUnit.SECONDS:
            return util_1.range(0, 60);
        case timeunit_1.TimeUnit.MINUTES:
            return util_1.range(0, 60);
        case timeunit_1.TimeUnit.HOURS:
            return util_1.range(0, 24);
        case timeunit_1.TimeUnit.DAY:
            return util_1.range(0, 7);
        case timeunit_1.TimeUnit.DATE:
            return util_1.range(1, 32);
        case timeunit_1.TimeUnit.MONTH:
            return util_1.range(0, 12);
    }
    return null;
}
exports.rawDomain = rawDomain;

},{"../channel":14,"../timeunit":59,"../util":61}],48:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var aggregate_1 = require('../aggregate');
var channel_1 = require('../channel');
var config_1 = require('../config');
var data_1 = require('../data');
var vlEncoding = require('../encoding');
var fielddef_1 = require('../fielddef');
var mark_1 = require('../mark');
var scale_1 = require('../scale');
var type_1 = require('../type');
var util_1 = require('../util');
var axis_1 = require('./axis');
var common_1 = require('./common');
var config_2 = require('./config');
var data_2 = require('./data/data');
var legend_1 = require('./legend');
var layout_1 = require('./layout');
var model_1 = require('./model');
var mark_2 = require('./mark/mark');
var scale_2 = require('./scale');
var stack_1 = require('./stack');
var UnitModel = (function (_super) {
    __extends(UnitModel, _super);
    function UnitModel(spec, parent, parentGivenName) {
        _super.call(this, spec, parent, parentGivenName);
        var mark = this._mark = spec.mark;
        var encoding = this._encoding = this._initEncoding(mark, spec.encoding || {});
        var config = this._config = this._initConfig(spec.config, parent, mark, encoding);
        var scale = this._scale = this._initScale(mark, encoding, config);
        this._axis = this._initAxis(encoding, config);
        this._legend = this._initLegend(encoding, config);
        this._stack = stack_1.compileStackProperties(mark, encoding, scale, config);
    }
    UnitModel.prototype._initEncoding = function (mark, encoding) {
        encoding = util_1.duplicate(encoding);
        vlEncoding.forEach(encoding, function (fieldDef, channel) {
            if (!channel_1.supportMark(channel, mark)) {
                console.warn(channel, 'dropped as it is incompatible with', mark);
                delete fieldDef.field;
                return;
            }
            if (fieldDef.type) {
                fieldDef.type = type_1.getFullName(fieldDef.type);
            }
            if ((channel === channel_1.PATH || channel === channel_1.ORDER) && !fieldDef.aggregate && fieldDef.type === type_1.QUANTITATIVE) {
                fieldDef.aggregate = aggregate_1.AggregateOp.MIN;
            }
        });
        return encoding;
    };
    UnitModel.prototype._initConfig = function (specConfig, parent, mark, encoding) {
        var config = util_1.mergeDeep(util_1.duplicate(config_1.defaultConfig), parent ? parent.config() : {}, specConfig);
        config.mark = config_2.initMarkConfig(mark, encoding, config);
        return config;
    };
    UnitModel.prototype._initScale = function (mark, encoding, config) {
        return channel_1.UNIT_SCALE_CHANNELS.reduce(function (_scale, channel) {
            if (vlEncoding.has(encoding, channel) ||
                (channel === channel_1.X && vlEncoding.has(encoding, channel_1.X2)) ||
                (channel === channel_1.Y && vlEncoding.has(encoding, channel_1.Y2))) {
                var targetChannel = channel;
                if (!vlEncoding.has(encoding, channel)) {
                    targetChannel = channel === channel_1.X ? channel_1.X2 : channel_1.Y2;
                }
                var channelDef = encoding[targetChannel];
                var scaleSpec = channelDef.scale || {};
                var _scaleType = scale_2.scaleType(scaleSpec, channelDef, channel, mark);
                _scale[channel] = util_1.extend({
                    type: _scaleType,
                    round: config.scale.round,
                    padding: config.scale.padding,
                    useRawDomain: config.scale.useRawDomain,
                    bandSize: channel === channel_1.X && _scaleType === scale_1.ScaleType.ORDINAL && mark === mark_1.TEXT ?
                        config.scale.textBandWidth : config.scale.bandSize
                }, scaleSpec);
            }
            return _scale;
        }, {});
    };
    UnitModel.prototype._initAxis = function (encoding, config) {
        return [channel_1.X, channel_1.Y].reduce(function (_axis, channel) {
            if (vlEncoding.has(encoding, channel) ||
                (channel === channel_1.X && vlEncoding.has(encoding, channel_1.X2)) ||
                (channel === channel_1.Y && vlEncoding.has(encoding, channel_1.Y2))) {
                var targetChannel = channel;
                if (!vlEncoding.has(encoding, channel)) {
                    targetChannel = channel === channel_1.X ? channel_1.X2 : channel_1.Y2;
                }
                var axisSpec = encoding[targetChannel].axis;
                if (axisSpec !== false) {
                    _axis[channel] = util_1.extend({}, config.axis, axisSpec === true ? {} : axisSpec || {});
                }
            }
            return _axis;
        }, {});
    };
    UnitModel.prototype._initLegend = function (encoding, config) {
        return channel_1.NONSPATIAL_SCALE_CHANNELS.reduce(function (_legend, channel) {
            if (vlEncoding.has(encoding, channel)) {
                var legendSpec = encoding[channel].legend;
                if (legendSpec !== false) {
                    _legend[channel] = util_1.extend({}, config.legend, legendSpec === true ? {} : legendSpec || {});
                }
            }
            return _legend;
        }, {});
    };
    UnitModel.prototype.parseData = function () {
        this.component.data = data_2.parseUnitData(this);
    };
    UnitModel.prototype.parseSelectionData = function () {
    };
    UnitModel.prototype.parseLayoutData = function () {
        this.component.layout = layout_1.parseUnitLayout(this);
    };
    UnitModel.prototype.parseScale = function () {
        this.component.scale = scale_2.parseScaleComponent(this);
    };
    UnitModel.prototype.parseMark = function () {
        this.component.mark = mark_2.parseMark(this);
    };
    UnitModel.prototype.parseAxis = function () {
        this.component.axis = axis_1.parseAxisComponent(this, [channel_1.X, channel_1.Y]);
    };
    UnitModel.prototype.parseAxisGroup = function () {
        return null;
    };
    UnitModel.prototype.parseGridGroup = function () {
        return null;
    };
    UnitModel.prototype.parseLegend = function () {
        this.component.legend = legend_1.parseLegendComponent(this);
    };
    UnitModel.prototype.assembleData = function (data) {
        return data_2.assembleData(this, data);
    };
    UnitModel.prototype.assembleLayout = function (layoutData) {
        return layout_1.assembleLayout(this, layoutData);
    };
    UnitModel.prototype.assembleMarks = function () {
        return this.component.mark;
    };
    UnitModel.prototype.assembleParentGroupProperties = function (cellConfig) {
        return common_1.applyConfig({}, cellConfig, common_1.FILL_STROKE_CONFIG.concat(['clip']));
    };
    UnitModel.prototype.channels = function () {
        return channel_1.UNIT_CHANNELS;
    };
    UnitModel.prototype.mapping = function () {
        return this.encoding();
    };
    UnitModel.prototype.stack = function () {
        return this._stack;
    };
    UnitModel.prototype.toSpec = function (excludeConfig, excludeData) {
        var encoding = util_1.duplicate(this._encoding);
        var spec;
        spec = {
            mark: this._mark,
            encoding: encoding
        };
        if (!excludeConfig) {
            spec.config = util_1.duplicate(this._config);
        }
        if (!excludeData) {
            spec.data = util_1.duplicate(this._data);
        }
        return spec;
    };
    UnitModel.prototype.mark = function () {
        return this._mark;
    };
    UnitModel.prototype.has = function (channel) {
        return vlEncoding.has(this._encoding, channel);
    };
    UnitModel.prototype.encoding = function () {
        return this._encoding;
    };
    UnitModel.prototype.fieldDef = function (channel) {
        return this._encoding[channel] || {};
    };
    UnitModel.prototype.field = function (channel, opt) {
        if (opt === void 0) { opt = {}; }
        var fieldDef = this.fieldDef(channel);
        if (fieldDef.bin) {
            opt = util_1.extend({
                binSuffix: this.scale(channel).type === scale_1.ScaleType.ORDINAL ? '_range' : '_start'
            }, opt);
        }
        return fielddef_1.field(fieldDef, opt);
    };
    UnitModel.prototype.dataTable = function () {
        return this.dataName(vlEncoding.isAggregate(this._encoding) ? data_1.SUMMARY : data_1.SOURCE);
    };
    UnitModel.prototype.isUnit = function () {
        return true;
    };
    return UnitModel;
}(model_1.Model));
exports.UnitModel = UnitModel;

},{"../aggregate":11,"../channel":14,"../config":49,"../data":50,"../encoding":51,"../fielddef":52,"../mark":54,"../scale":55,"../type":60,"../util":61,"./axis":15,"./common":16,"./config":18,"./data/data":21,"./layout":34,"./legend":35,"./mark/mark":39,"./model":44,"./scale":45,"./stack":46}],49:[function(require,module,exports){
"use strict";
var scale_1 = require('./scale');
var axis_1 = require('./axis');
var legend_1 = require('./legend');
exports.defaultCellConfig = {
    width: 200,
    height: 200
};
exports.defaultFacetCellConfig = {
    stroke: '#ccc',
    strokeWidth: 1
};
var defaultFacetGridConfig = {
    color: '#000000',
    opacity: 0.4,
    offset: 0
};
exports.defaultFacetConfig = {
    scale: scale_1.defaultFacetScaleConfig,
    axis: axis_1.defaultFacetAxisConfig,
    grid: defaultFacetGridConfig,
    cell: exports.defaultFacetCellConfig
};
(function (FontWeight) {
    FontWeight[FontWeight["NORMAL"] = 'normal'] = "NORMAL";
    FontWeight[FontWeight["BOLD"] = 'bold'] = "BOLD";
})(exports.FontWeight || (exports.FontWeight = {}));
var FontWeight = exports.FontWeight;
(function (Shape) {
    Shape[Shape["CIRCLE"] = 'circle'] = "CIRCLE";
    Shape[Shape["SQUARE"] = 'square'] = "SQUARE";
    Shape[Shape["CROSS"] = 'cross'] = "CROSS";
    Shape[Shape["DIAMOND"] = 'diamond'] = "DIAMOND";
    Shape[Shape["TRIANGLEUP"] = 'triangle-up'] = "TRIANGLEUP";
    Shape[Shape["TRIANGLEDOWN"] = 'triangle-down'] = "TRIANGLEDOWN";
})(exports.Shape || (exports.Shape = {}));
var Shape = exports.Shape;
(function (HorizontalAlign) {
    HorizontalAlign[HorizontalAlign["LEFT"] = 'left'] = "LEFT";
    HorizontalAlign[HorizontalAlign["RIGHT"] = 'right'] = "RIGHT";
    HorizontalAlign[HorizontalAlign["CENTER"] = 'center'] = "CENTER";
})(exports.HorizontalAlign || (exports.HorizontalAlign = {}));
var HorizontalAlign = exports.HorizontalAlign;
(function (VerticalAlign) {
    VerticalAlign[VerticalAlign["TOP"] = 'top'] = "TOP";
    VerticalAlign[VerticalAlign["MIDDLE"] = 'middle'] = "MIDDLE";
    VerticalAlign[VerticalAlign["BOTTOM"] = 'bottom'] = "BOTTOM";
})(exports.VerticalAlign || (exports.VerticalAlign = {}));
var VerticalAlign = exports.VerticalAlign;
(function (FontStyle) {
    FontStyle[FontStyle["NORMAL"] = 'normal'] = "NORMAL";
    FontStyle[FontStyle["ITALIC"] = 'italic'] = "ITALIC";
})(exports.FontStyle || (exports.FontStyle = {}));
var FontStyle = exports.FontStyle;
(function (StackOffset) {
    StackOffset[StackOffset["ZERO"] = 'zero'] = "ZERO";
    StackOffset[StackOffset["CENTER"] = 'center'] = "CENTER";
    StackOffset[StackOffset["NORMALIZE"] = 'normalize'] = "NORMALIZE";
    StackOffset[StackOffset["NONE"] = 'none'] = "NONE";
})(exports.StackOffset || (exports.StackOffset = {}));
var StackOffset = exports.StackOffset;
(function (Interpolate) {
    Interpolate[Interpolate["LINEAR"] = 'linear'] = "LINEAR";
    Interpolate[Interpolate["LINEAR_CLOSED"] = 'linear-closed'] = "LINEAR_CLOSED";
    Interpolate[Interpolate["STEP"] = 'step'] = "STEP";
    Interpolate[Interpolate["STEP_BEFORE"] = 'step-before'] = "STEP_BEFORE";
    Interpolate[Interpolate["STEP_AFTER"] = 'step-after'] = "STEP_AFTER";
    Interpolate[Interpolate["BASIS"] = 'basis'] = "BASIS";
    Interpolate[Interpolate["BASIS_OPEN"] = 'basis-open'] = "BASIS_OPEN";
    Interpolate[Interpolate["BASIS_CLOSED"] = 'basis-closed'] = "BASIS_CLOSED";
    Interpolate[Interpolate["CARDINAL"] = 'cardinal'] = "CARDINAL";
    Interpolate[Interpolate["CARDINAL_OPEN"] = 'cardinal-open'] = "CARDINAL_OPEN";
    Interpolate[Interpolate["CARDINAL_CLOSED"] = 'cardinal-closed'] = "CARDINAL_CLOSED";
    Interpolate[Interpolate["BUNDLE"] = 'bundle'] = "BUNDLE";
    Interpolate[Interpolate["MONOTONE"] = 'monotone'] = "MONOTONE";
})(exports.Interpolate || (exports.Interpolate = {}));
var Interpolate = exports.Interpolate;
exports.defaultMarkConfig = {
    color: '#4682b4',
    strokeWidth: 2,
    size: 30,
    barThinSize: 2,
    ruleSize: 1,
    tickThickness: 1,
    fontSize: 10,
    baseline: VerticalAlign.MIDDLE,
    text: 'Abc',
    shortTimeLabels: false,
    applyColorToBackground: false
};
exports.defaultConfig = {
    numberFormat: 's',
    timeFormat: '%Y-%m-%d',
    cell: exports.defaultCellConfig,
    mark: exports.defaultMarkConfig,
    scale: scale_1.defaultScaleConfig,
    axis: axis_1.defaultAxisConfig,
    legend: legend_1.defaultLegendConfig,
    facet: exports.defaultFacetConfig,
};

},{"./axis":12,"./legend":53,"./scale":55}],50:[function(require,module,exports){
"use strict";
var type_1 = require('./type');
(function (DataFormat) {
    DataFormat[DataFormat["JSON"] = 'json'] = "JSON";
    DataFormat[DataFormat["CSV"] = 'csv'] = "CSV";
    DataFormat[DataFormat["TSV"] = 'tsv'] = "TSV";
})(exports.DataFormat || (exports.DataFormat = {}));
var DataFormat = exports.DataFormat;
(function (DataTable) {
    DataTable[DataTable["SOURCE"] = 'source'] = "SOURCE";
    DataTable[DataTable["SUMMARY"] = 'summary'] = "SUMMARY";
    DataTable[DataTable["STACKED_SCALE"] = 'stacked_scale'] = "STACKED_SCALE";
    DataTable[DataTable["LAYOUT"] = 'layout'] = "LAYOUT";
})(exports.DataTable || (exports.DataTable = {}));
var DataTable = exports.DataTable;
exports.SUMMARY = DataTable.SUMMARY;
exports.SOURCE = DataTable.SOURCE;
exports.STACKED_SCALE = DataTable.STACKED_SCALE;
exports.LAYOUT = DataTable.LAYOUT;
exports.types = {
    'boolean': type_1.Type.NOMINAL,
    'number': type_1.Type.QUANTITATIVE,
    'integer': type_1.Type.QUANTITATIVE,
    'date': type_1.Type.TEMPORAL,
    'string': type_1.Type.NOMINAL
};

},{"./type":60}],51:[function(require,module,exports){
"use strict";
var channel_1 = require('./channel');
var util_1 = require('./util');
function countRetinal(encoding) {
    var count = 0;
    if (encoding.color) {
        count++;
    }
    if (encoding.opacity) {
        count++;
    }
    if (encoding.size) {
        count++;
    }
    if (encoding.shape) {
        count++;
    }
    return count;
}
exports.countRetinal = countRetinal;
function channels(encoding) {
    return channel_1.CHANNELS.filter(function (channel) {
        return has(encoding, channel);
    });
}
exports.channels = channels;
function has(encoding, channel) {
    var channelEncoding = encoding && encoding[channel];
    return channelEncoding && (channelEncoding.field !== undefined ||
        (util_1.isArray(channelEncoding) && channelEncoding.length > 0));
}
exports.has = has;
function isAggregate(encoding) {
    return util_1.any(channel_1.CHANNELS, function (channel) {
        if (has(encoding, channel) && encoding[channel].aggregate) {
            return true;
        }
        return false;
    });
}
exports.isAggregate = isAggregate;
function isRanged(encoding) {
    return (has(encoding, channel_1.X) && has(encoding, channel_1.X2)) ||
        (has(encoding, channel_1.Y) && has(encoding, channel_1.Y2));
}
exports.isRanged = isRanged;
function fieldDefs(encoding) {
    var arr = [];
    channel_1.CHANNELS.forEach(function (channel) {
        if (has(encoding, channel)) {
            if (util_1.isArray(encoding[channel])) {
                encoding[channel].forEach(function (fieldDef) {
                    arr.push(fieldDef);
                });
            }
            else {
                arr.push(encoding[channel]);
            }
        }
    });
    return arr;
}
exports.fieldDefs = fieldDefs;
;
function forEach(encoding, f, thisArg) {
    channelMappingForEach(channel_1.CHANNELS, encoding, f, thisArg);
}
exports.forEach = forEach;
function channelMappingForEach(channels, mapping, f, thisArg) {
    var i = 0;
    channels.forEach(function (channel) {
        if (has(mapping, channel)) {
            if (util_1.isArray(mapping[channel])) {
                mapping[channel].forEach(function (fieldDef) {
                    f.call(thisArg, fieldDef, channel, i++);
                });
            }
            else {
                f.call(thisArg, mapping[channel], channel, i++);
            }
        }
    });
}
exports.channelMappingForEach = channelMappingForEach;
function map(encoding, f, thisArg) {
    return channelMappingMap(channel_1.CHANNELS, encoding, f, thisArg);
}
exports.map = map;
function channelMappingMap(channels, mapping, f, thisArg) {
    var arr = [];
    channels.forEach(function (channel) {
        if (has(mapping, channel)) {
            if (util_1.isArray(mapping[channel])) {
                mapping[channel].forEach(function (fieldDef) {
                    arr.push(f.call(thisArg, fieldDef, channel));
                });
            }
            else {
                arr.push(f.call(thisArg, mapping[channel], channel));
            }
        }
    });
    return arr;
}
exports.channelMappingMap = channelMappingMap;
function reduce(encoding, f, init, thisArg) {
    return channelMappingReduce(channel_1.CHANNELS, encoding, f, init, thisArg);
}
exports.reduce = reduce;
function channelMappingReduce(channels, mapping, f, init, thisArg) {
    var r = init;
    channel_1.CHANNELS.forEach(function (channel) {
        if (has(mapping, channel)) {
            if (util_1.isArray(mapping[channel])) {
                mapping[channel].forEach(function (fieldDef) {
                    r = f.call(thisArg, r, fieldDef, channel);
                });
            }
            else {
                r = f.call(thisArg, r, mapping[channel], channel);
            }
        }
    });
    return r;
}
exports.channelMappingReduce = channelMappingReduce;

},{"./channel":14,"./util":61}],52:[function(require,module,exports){
"use strict";
var aggregate_1 = require('./aggregate');
var timeunit_1 = require('./timeunit');
var type_1 = require('./type');
var util_1 = require('./util');
exports.aggregate = {
    type: 'string',
    enum: aggregate_1.AGGREGATE_OPS,
    supportedEnums: {
        quantitative: aggregate_1.AGGREGATE_OPS,
        ordinal: ['median', 'min', 'max'],
        nominal: [],
        temporal: ['mean', 'median', 'min', 'max'],
        '': ['count']
    },
    supportedTypes: util_1.toMap([type_1.QUANTITATIVE, type_1.NOMINAL, type_1.ORDINAL, type_1.TEMPORAL, ''])
};
function field(fieldDef, opt) {
    if (opt === void 0) { opt = {}; }
    var prefix = (opt.datum ? 'datum.' : '') + (opt.prefn || '');
    var suffix = opt.suffix || '';
    var field = fieldDef.field;
    if (isCount(fieldDef)) {
        return prefix + 'count' + suffix;
    }
    else if (opt.fn) {
        return prefix + opt.fn + '_' + field + suffix;
    }
    else if (!opt.nofn && fieldDef.bin) {
        return prefix + 'bin_' + field + (opt.binSuffix || suffix || '_start');
    }
    else if (!opt.nofn && !opt.noAggregate && fieldDef.aggregate) {
        return prefix + fieldDef.aggregate + '_' + field + suffix;
    }
    else if (!opt.nofn && fieldDef.timeUnit) {
        return prefix + fieldDef.timeUnit + '_' + field + suffix;
    }
    else {
        return prefix + field;
    }
}
exports.field = field;
function _isFieldDimension(fieldDef) {
    return util_1.contains([type_1.NOMINAL, type_1.ORDINAL], fieldDef.type) || !!fieldDef.bin ||
        (fieldDef.type === type_1.TEMPORAL && !!fieldDef.timeUnit);
}
function isDimension(fieldDef) {
    return fieldDef && fieldDef.field && _isFieldDimension(fieldDef);
}
exports.isDimension = isDimension;
function isMeasure(fieldDef) {
    return fieldDef && fieldDef.field && !_isFieldDimension(fieldDef);
}
exports.isMeasure = isMeasure;
exports.COUNT_TITLE = 'Number of Records';
function count() {
    return { field: '*', aggregate: aggregate_1.AggregateOp.COUNT, type: type_1.QUANTITATIVE, title: exports.COUNT_TITLE };
}
exports.count = count;
function isCount(fieldDef) {
    return fieldDef.aggregate === aggregate_1.AggregateOp.COUNT;
}
exports.isCount = isCount;
function cardinality(fieldDef, stats, filterNull) {
    if (filterNull === void 0) { filterNull = {}; }
    var stat = stats[fieldDef.field], type = fieldDef.type;
    if (fieldDef.bin) {
        var bin_1 = fieldDef.bin;
        var maxbins = (typeof bin_1 === 'boolean') ? undefined : bin_1.maxbins;
        if (maxbins === undefined) {
            maxbins = 10;
        }
        var bins = util_1.getbins(stat, maxbins);
        return (bins.stop - bins.start) / bins.step;
    }
    if (type === type_1.TEMPORAL) {
        var timeUnit = fieldDef.timeUnit;
        switch (timeUnit) {
            case timeunit_1.TimeUnit.SECONDS: return 60;
            case timeunit_1.TimeUnit.MINUTES: return 60;
            case timeunit_1.TimeUnit.HOURS: return 24;
            case timeunit_1.TimeUnit.DAY: return 7;
            case timeunit_1.TimeUnit.DATE: return 31;
            case timeunit_1.TimeUnit.MONTH: return 12;
            case timeunit_1.TimeUnit.YEAR:
                var yearstat = stats['year_' + fieldDef.field];
                if (!yearstat) {
                    return null;
                }
                return yearstat.distinct -
                    (stat.missing > 0 && filterNull[type] ? 1 : 0);
        }
    }
    if (fieldDef.aggregate) {
        return 1;
    }
    return stat.distinct -
        (stat.missing > 0 && filterNull[type] ? 1 : 0);
}
exports.cardinality = cardinality;
function title(fieldDef) {
    if (fieldDef.title != null) {
        return fieldDef.title;
    }
    if (isCount(fieldDef)) {
        return exports.COUNT_TITLE;
    }
    var fn = fieldDef.aggregate || fieldDef.timeUnit || (fieldDef.bin && 'bin');
    if (fn) {
        return fn.toString().toUpperCase() + '(' + fieldDef.field + ')';
    }
    else {
        return fieldDef.field;
    }
}
exports.title = title;

},{"./aggregate":11,"./timeunit":59,"./type":60,"./util":61}],53:[function(require,module,exports){
"use strict";
exports.defaultLegendConfig = {
    orient: undefined,
    shortTimeLabels: false
};

},{}],54:[function(require,module,exports){
"use strict";
(function (Mark) {
    Mark[Mark["AREA"] = 'area'] = "AREA";
    Mark[Mark["BAR"] = 'bar'] = "BAR";
    Mark[Mark["LINE"] = 'line'] = "LINE";
    Mark[Mark["POINT"] = 'point'] = "POINT";
    Mark[Mark["TEXT"] = 'text'] = "TEXT";
    Mark[Mark["TICK"] = 'tick'] = "TICK";
    Mark[Mark["RULE"] = 'rule'] = "RULE";
    Mark[Mark["CIRCLE"] = 'circle'] = "CIRCLE";
    Mark[Mark["SQUARE"] = 'square'] = "SQUARE";
    Mark[Mark["ERRORBAR"] = 'errorBar'] = "ERRORBAR";
    Mark[Mark["BOXPLOT"] = 'boxPlot'] = "BOXPLOT";
})(exports.Mark || (exports.Mark = {}));
var Mark = exports.Mark;
exports.AREA = Mark.AREA;
exports.BAR = Mark.BAR;
exports.LINE = Mark.LINE;
exports.POINT = Mark.POINT;
exports.TEXT = Mark.TEXT;
exports.TICK = Mark.TICK;
exports.RULE = Mark.RULE;
exports.CIRCLE = Mark.CIRCLE;
exports.SQUARE = Mark.SQUARE;
exports.ERRORBAR = Mark.ERRORBAR;
exports.BOXPLOT = Mark.BOXPLOT;

},{}],55:[function(require,module,exports){
"use strict";
(function (ScaleType) {
    ScaleType[ScaleType["LINEAR"] = 'linear'] = "LINEAR";
    ScaleType[ScaleType["LOG"] = 'log'] = "LOG";
    ScaleType[ScaleType["POW"] = 'pow'] = "POW";
    ScaleType[ScaleType["SQRT"] = 'sqrt'] = "SQRT";
    ScaleType[ScaleType["QUANTILE"] = 'quantile'] = "QUANTILE";
    ScaleType[ScaleType["QUANTIZE"] = 'quantize'] = "QUANTIZE";
    ScaleType[ScaleType["ORDINAL"] = 'ordinal'] = "ORDINAL";
    ScaleType[ScaleType["TIME"] = 'time'] = "TIME";
    ScaleType[ScaleType["UTC"] = 'utc'] = "UTC";
})(exports.ScaleType || (exports.ScaleType = {}));
var ScaleType = exports.ScaleType;
(function (NiceTime) {
    NiceTime[NiceTime["SECOND"] = 'second'] = "SECOND";
    NiceTime[NiceTime["MINUTE"] = 'minute'] = "MINUTE";
    NiceTime[NiceTime["HOUR"] = 'hour'] = "HOUR";
    NiceTime[NiceTime["DAY"] = 'day'] = "DAY";
    NiceTime[NiceTime["WEEK"] = 'week'] = "WEEK";
    NiceTime[NiceTime["MONTH"] = 'month'] = "MONTH";
    NiceTime[NiceTime["YEAR"] = 'year'] = "YEAR";
})(exports.NiceTime || (exports.NiceTime = {}));
var NiceTime = exports.NiceTime;
exports.defaultScaleConfig = {
    round: true,
    textBandWidth: 90,
    bandSize: 21,
    padding: 1,
    useRawDomain: false,
    opacity: [0.3, 0.8],
    nominalColorRange: 'category10',
    sequentialColorRange: ['#AFC6A3', '#09622A'],
    shapeRange: 'shapes',
    fontSizeRange: [8, 40],
    ruleSizeRange: [1, 5],
    tickSizeRange: [1, 20]
};
exports.defaultFacetScaleConfig = {
    round: true,
    padding: 16
};

},{}],56:[function(require,module,exports){
"use strict";
var aggregate_1 = require('./aggregate');
var timeunit_1 = require('./timeunit');
var type_1 = require('./type');
var vlEncoding = require('./encoding');
var mark_1 = require('./mark');
exports.DELIM = '|';
exports.ASSIGN = '=';
exports.TYPE = ',';
exports.FUNC = '_';
function shorten(spec) {
    return 'mark' + exports.ASSIGN + spec.mark +
        exports.DELIM + shortenEncoding(spec.encoding);
}
exports.shorten = shorten;
function parse(shorthand, data, config) {
    var split = shorthand.split(exports.DELIM), mark = split.shift().split(exports.ASSIGN)[1].trim(), encoding = parseEncoding(split.join(exports.DELIM));
    var spec = {
        mark: mark_1.Mark[mark],
        encoding: encoding
    };
    if (data !== undefined) {
        spec.data = data;
    }
    if (config !== undefined) {
        spec.config = config;
    }
    return spec;
}
exports.parse = parse;
function shortenEncoding(encoding) {
    return vlEncoding.map(encoding, function (fieldDef, channel) {
        return channel + exports.ASSIGN + shortenFieldDef(fieldDef);
    }).join(exports.DELIM);
}
exports.shortenEncoding = shortenEncoding;
function parseEncoding(encodingShorthand) {
    return encodingShorthand.split(exports.DELIM).reduce(function (m, e) {
        var split = e.split(exports.ASSIGN), enctype = split[0].trim(), fieldDefShorthand = split[1];
        m[enctype] = parseFieldDef(fieldDefShorthand);
        return m;
    }, {});
}
exports.parseEncoding = parseEncoding;
function shortenFieldDef(fieldDef) {
    return (fieldDef.aggregate ? fieldDef.aggregate + exports.FUNC : '') +
        (fieldDef.timeUnit ? fieldDef.timeUnit + exports.FUNC : '') +
        (fieldDef.bin ? 'bin' + exports.FUNC : '') +
        (fieldDef.field || '') + exports.TYPE + type_1.SHORT_TYPE[fieldDef.type];
}
exports.shortenFieldDef = shortenFieldDef;
function shortenFieldDefs(fieldDefs, delim) {
    if (delim === void 0) { delim = exports.DELIM; }
    return fieldDefs.map(shortenFieldDef).join(delim);
}
exports.shortenFieldDefs = shortenFieldDefs;
function parseFieldDef(fieldDefShorthand) {
    var split = fieldDefShorthand.split(exports.TYPE);
    var fieldDef = {
        field: split[0].trim(),
        type: type_1.TYPE_FROM_SHORT_TYPE[split[1].trim()]
    };
    for (var i = 0; i < aggregate_1.AGGREGATE_OPS.length; i++) {
        var a = aggregate_1.AGGREGATE_OPS[i];
        if (fieldDef.field.indexOf(a + '_') === 0) {
            fieldDef.field = fieldDef.field.substr(a.toString().length + 1);
            if (a === aggregate_1.AggregateOp.COUNT && fieldDef.field.length === 0) {
                fieldDef.field = '*';
            }
            fieldDef.aggregate = a;
            break;
        }
    }
    for (var i = 0; i < timeunit_1.TIMEUNITS.length; i++) {
        var tu = timeunit_1.TIMEUNITS[i];
        if (fieldDef.field && fieldDef.field.indexOf(tu + '_') === 0) {
            fieldDef.field = fieldDef.field.substr(fieldDef.field.length + 1);
            fieldDef.timeUnit = tu;
            break;
        }
    }
    if (fieldDef.field && fieldDef.field.indexOf('bin_') === 0) {
        fieldDef.field = fieldDef.field.substr(4);
        fieldDef.bin = true;
    }
    return fieldDef;
}
exports.parseFieldDef = parseFieldDef;

},{"./aggregate":11,"./encoding":51,"./mark":54,"./timeunit":59,"./type":60}],57:[function(require,module,exports){
"use strict";
(function (SortOrder) {
    SortOrder[SortOrder["ASCENDING"] = 'ascending'] = "ASCENDING";
    SortOrder[SortOrder["DESCENDING"] = 'descending'] = "DESCENDING";
    SortOrder[SortOrder["NONE"] = 'none'] = "NONE";
})(exports.SortOrder || (exports.SortOrder = {}));
var SortOrder = exports.SortOrder;

},{}],58:[function(require,module,exports){
"use strict";
var encoding_1 = require('./encoding');
var type_1 = require('./type');
var channel_1 = require('./channel');
var vlEncoding = require('./encoding');
var mark_1 = require('./mark');
var util_1 = require('./util');
function isFacetSpec(spec) {
    return spec['facet'] !== undefined;
}
exports.isFacetSpec = isFacetSpec;
function isExtendedUnitSpec(spec) {
    if (isSomeUnitSpec(spec)) {
        var hasRow = encoding_1.has(spec.encoding, channel_1.ROW);
        var hasColumn = encoding_1.has(spec.encoding, channel_1.COLUMN);
        return hasRow || hasColumn;
    }
    return false;
}
exports.isExtendedUnitSpec = isExtendedUnitSpec;
function isUnitSpec(spec) {
    if (isSomeUnitSpec(spec)) {
        return !isExtendedUnitSpec(spec);
    }
    return false;
}
exports.isUnitSpec = isUnitSpec;
function isSomeUnitSpec(spec) {
    return spec['mark'] !== undefined;
}
exports.isSomeUnitSpec = isSomeUnitSpec;
function isLayerSpec(spec) {
    return spec['layers'] !== undefined;
}
exports.isLayerSpec = isLayerSpec;
function normalize(spec) {
    if (isExtendedUnitSpec(spec)) {
        return normalizeExtendedUnitSpec(spec);
    }
    if (isUnitSpec(spec)) {
        return normalizeUnitSpec(spec);
    }
    return spec;
}
exports.normalize = normalize;
function normalizeExtendedUnitSpec(spec) {
    var hasRow = encoding_1.has(spec.encoding, channel_1.ROW);
    var hasColumn = encoding_1.has(spec.encoding, channel_1.COLUMN);
    var encoding = util_1.duplicate(spec.encoding);
    delete encoding.column;
    delete encoding.row;
    return util_1.extend(spec.name ? { name: spec.name } : {}, spec.description ? { description: spec.description } : {}, { data: spec.data }, spec.transform ? { transform: spec.transform } : {}, {
        facet: util_1.extend(hasRow ? { row: spec.encoding.row } : {}, hasColumn ? { column: spec.encoding.column } : {}),
        spec: normalizeUnitSpec({
            mark: spec.mark,
            encoding: encoding
        })
    }, spec.config ? { config: spec.config } : {});
}
exports.normalizeExtendedUnitSpec = normalizeExtendedUnitSpec;
function normalizeUnitSpec(spec) {
    if (util_1.contains([mark_1.ERRORBAR, mark_1.BOXPLOT], spec.mark)) {
        return normalizeCompositeUnitSpec(spec);
    }
    if (encoding_1.isRanged(spec.encoding)) {
        return normalizeRangedUnitSpec(spec);
    }
    return spec;
}
exports.normalizeUnitSpec = normalizeUnitSpec;
function normalizeRangedUnitSpec(spec) {
    if (spec.encoding) {
        var hasX = encoding_1.has(spec.encoding, channel_1.X);
        var hasY = encoding_1.has(spec.encoding, channel_1.Y);
        var hasX2 = encoding_1.has(spec.encoding, channel_1.X2);
        var hasY2 = encoding_1.has(spec.encoding, channel_1.Y2);
        if ((hasX2 && !hasX) || (hasY2 && !hasY)) {
            var normalizedSpec = util_1.duplicate(spec);
            if (hasX2 && !hasX) {
                normalizedSpec.encoding.x = util_1.duplicate(normalizedSpec.encoding.x2);
                delete normalizedSpec.encoding.x2;
            }
            if (hasY2 && !hasY) {
                normalizedSpec.encoding.y = util_1.duplicate(normalizedSpec.encoding.y2);
                delete normalizedSpec.encoding.y2;
            }
            return normalizedSpec;
        }
    }
    return spec;
}
exports.normalizeRangedUnitSpec = normalizeRangedUnitSpec;
function normalizeCompositeUnitSpec(spec) {
    var layerSpec = util_1.extend(spec.name ? { name: spec.name } : {}, spec.description ? { description: spec.description } : {}, spec.data ? { data: spec.data } : {}, spec.transform ? { transform: spec.transform } : {}, spec.config ? { config: spec.config } : {}, { layers: [] });
    if (!spec.encoding) {
        return layerSpec;
    }
    if (spec.mark === mark_1.ERRORBAR) {
        var ruleSpec = {
            mark: mark_1.RULE,
            encoding: util_1.extend(spec.encoding.x ? { x: util_1.duplicate(spec.encoding.x) } : {}, spec.encoding.y ? { y: util_1.duplicate(spec.encoding.y) } : {}, spec.encoding.x2 ? { x2: util_1.duplicate(spec.encoding.x2) } : {}, spec.encoding.y2 ? { y2: util_1.duplicate(spec.encoding.y2) } : {}, {})
        };
        var lowerTickSpec = {
            mark: mark_1.TICK,
            encoding: util_1.extend(spec.encoding.x ? { x: util_1.duplicate(spec.encoding.x) } : {}, spec.encoding.y ? { y: util_1.duplicate(spec.encoding.y) } : {}, spec.encoding.size ? { size: util_1.duplicate(spec.encoding.size) } : {}, {})
        };
        var upperTickSpec = {
            mark: mark_1.TICK,
            encoding: util_1.extend({
                x: spec.encoding.x2 ? util_1.duplicate(spec.encoding.x2) : util_1.duplicate(spec.encoding.x),
                y: spec.encoding.y2 ? util_1.duplicate(spec.encoding.y2) : util_1.duplicate(spec.encoding.y)
            }, spec.encoding.size ? { size: util_1.duplicate(spec.encoding.size) } : {})
        };
        layerSpec.layers.push(normalizeUnitSpec(ruleSpec));
        layerSpec.layers.push(normalizeUnitSpec(lowerTickSpec));
        layerSpec.layers.push(normalizeUnitSpec(upperTickSpec));
    }
    else if (spec.mark === mark_1.BOXPLOT) {
        if (!spec.encoding.x || !spec.encoding.y ||
            !(spec.encoding.x.type === type_1.QUANTITATIVE ||
                spec.encoding.y.type === type_1.QUANTITATIVE)) {
            return layerSpec;
        }
        var orient = spec.encoding.x.aggregate && spec.encoding.x.type === type_1.QUANTITATIVE ? 'horizontal' : 'vertical';
        var ruleSpec = {
            mark: mark_1.RULE,
            encoding: util_1.extend({ x: util_1.duplicate(spec.encoding.x) }, { y: util_1.duplicate(spec.encoding.y) }, orient === 'vertical' ? { y2: util_1.duplicate(spec.encoding.y) } : { x2: util_1.duplicate(spec.encoding.x) }, {})
        };
        var upperTickSpec = {
            mark: mark_1.TICK,
            encoding: util_1.extend({ x: util_1.duplicate(spec.encoding.x) }, { y: util_1.duplicate(spec.encoding.y) }, {})
        };
        var lowerTickSpec = {
            mark: mark_1.TICK,
            encoding: util_1.extend({ x: util_1.duplicate(spec.encoding.x) }, { y: util_1.duplicate(spec.encoding.y) }, {})
        };
        var loweBarSpec = {
            mark: mark_1.BAR,
            encoding: util_1.extend({ x: util_1.duplicate(spec.encoding.x) }, { y: util_1.duplicate(spec.encoding.y) }, orient === 'vertical' ? { y2: util_1.duplicate(spec.encoding.y) } : { x2: util_1.duplicate(spec.encoding.x) }, { color: { value: 'orange' } })
        };
        var upperBarSpec = {
            mark: mark_1.BAR,
            encoding: util_1.extend({ x: util_1.duplicate(spec.encoding.x) }, { y: util_1.duplicate(spec.encoding.y) }, orient === 'vertical' ? { y2: util_1.duplicate(spec.encoding.y) } : { x2: util_1.duplicate(spec.encoding.x) }, {})
        };
        var aggaxis = orient === 'vertical' ? 'y' : 'x';
        var aggaxis2 = orient === 'vertical' ? 'y2' : 'x2';
        ruleSpec.encoding[aggaxis].aggregate = 'min';
        ruleSpec.encoding[aggaxis2].aggregate = 'max';
        upperTickSpec.encoding[aggaxis].aggregate = 'max';
        lowerTickSpec.encoding[aggaxis].aggregate = 'min';
        loweBarSpec.encoding[aggaxis].aggregate = 'q1';
        loweBarSpec.encoding[aggaxis2].aggregate = 'median';
        upperBarSpec.encoding[aggaxis].aggregate = 'median';
        upperBarSpec.encoding[aggaxis2].aggregate = 'q3';
        layerSpec.layers.push(normalizeUnitSpec(ruleSpec));
        layerSpec.layers.push(normalizeUnitSpec(lowerTickSpec));
        layerSpec.layers.push(normalizeUnitSpec(upperTickSpec));
        layerSpec.layers.push(normalizeUnitSpec(loweBarSpec));
        layerSpec.layers.push(normalizeUnitSpec(upperBarSpec));
    }
    return layerSpec;
}
exports.normalizeCompositeUnitSpec = normalizeCompositeUnitSpec;
function alwaysNoOcclusion(spec) {
    return vlEncoding.isAggregate(spec.encoding);
}
exports.alwaysNoOcclusion = alwaysNoOcclusion;
function fieldDefs(spec) {
    return vlEncoding.fieldDefs(spec.encoding);
}
exports.fieldDefs = fieldDefs;
;
function getCleanSpec(spec) {
    return spec;
}
exports.getCleanSpec = getCleanSpec;
function isStack(spec) {
    return (vlEncoding.has(spec.encoding, channel_1.COLOR) || vlEncoding.has(spec.encoding, channel_1.SHAPE)) &&
        (spec.mark === mark_1.BAR || spec.mark === mark_1.AREA) &&
        (!spec.config || !spec.config.mark.stacked !== false) &&
        vlEncoding.isAggregate(spec.encoding);
}
exports.isStack = isStack;
function transpose(spec) {
    var oldenc = spec.encoding;
    var encoding = util_1.duplicate(spec.encoding);
    encoding.x = oldenc.y;
    encoding.y = oldenc.x;
    encoding.row = oldenc.column;
    encoding.column = oldenc.row;
    spec.encoding = encoding;
    return spec;
}
exports.transpose = transpose;

},{"./channel":14,"./encoding":51,"./mark":54,"./type":60,"./util":61}],59:[function(require,module,exports){
"use strict";
(function (TimeUnit) {
    TimeUnit[TimeUnit["YEAR"] = 'year'] = "YEAR";
    TimeUnit[TimeUnit["MONTH"] = 'month'] = "MONTH";
    TimeUnit[TimeUnit["DAY"] = 'day'] = "DAY";
    TimeUnit[TimeUnit["DATE"] = 'date'] = "DATE";
    TimeUnit[TimeUnit["HOURS"] = 'hours'] = "HOURS";
    TimeUnit[TimeUnit["MINUTES"] = 'minutes'] = "MINUTES";
    TimeUnit[TimeUnit["SECONDS"] = 'seconds'] = "SECONDS";
    TimeUnit[TimeUnit["MILLISECONDS"] = 'milliseconds'] = "MILLISECONDS";
    TimeUnit[TimeUnit["YEARMONTH"] = 'yearmonth'] = "YEARMONTH";
    TimeUnit[TimeUnit["YEARMONTHDAY"] = 'yearmonthday'] = "YEARMONTHDAY";
    TimeUnit[TimeUnit["YEARMONTHDATE"] = 'yearmonthdate'] = "YEARMONTHDATE";
    TimeUnit[TimeUnit["YEARDAY"] = 'yearday'] = "YEARDAY";
    TimeUnit[TimeUnit["YEARDATE"] = 'yeardate'] = "YEARDATE";
    TimeUnit[TimeUnit["YEARMONTHDAYHOURS"] = 'yearmonthdayhours'] = "YEARMONTHDAYHOURS";
    TimeUnit[TimeUnit["YEARMONTHDAYHOURSMINUTES"] = 'yearmonthdayhoursminutes'] = "YEARMONTHDAYHOURSMINUTES";
    TimeUnit[TimeUnit["YEARMONTHDAYHOURSMINUTESSECONDS"] = 'yearmonthdayhoursminutesseconds'] = "YEARMONTHDAYHOURSMINUTESSECONDS";
    TimeUnit[TimeUnit["HOURSMINUTES"] = 'hoursminutes'] = "HOURSMINUTES";
    TimeUnit[TimeUnit["HOURSMINUTESSECONDS"] = 'hoursminutesseconds'] = "HOURSMINUTESSECONDS";
    TimeUnit[TimeUnit["MINUTESSECONDS"] = 'minutesseconds'] = "MINUTESSECONDS";
    TimeUnit[TimeUnit["SECONDSMILLISECONDS"] = 'secondsmilliseconds'] = "SECONDSMILLISECONDS";
})(exports.TimeUnit || (exports.TimeUnit = {}));
var TimeUnit = exports.TimeUnit;
exports.TIMEUNITS = [
    TimeUnit.YEAR,
    TimeUnit.MONTH,
    TimeUnit.DAY,
    TimeUnit.DATE,
    TimeUnit.HOURS,
    TimeUnit.MINUTES,
    TimeUnit.SECONDS,
    TimeUnit.MILLISECONDS,
    TimeUnit.YEARMONTH,
    TimeUnit.YEARMONTHDAY,
    TimeUnit.YEARMONTHDATE,
    TimeUnit.YEARDAY,
    TimeUnit.YEARDATE,
    TimeUnit.YEARMONTHDAYHOURS,
    TimeUnit.YEARMONTHDAYHOURSMINUTES,
    TimeUnit.YEARMONTHDAYHOURSMINUTESSECONDS,
    TimeUnit.HOURSMINUTES,
    TimeUnit.HOURSMINUTESSECONDS,
    TimeUnit.MINUTESSECONDS,
    TimeUnit.SECONDSMILLISECONDS,
];
function format(timeUnit, abbreviated) {
    if (abbreviated === void 0) { abbreviated = false; }
    if (!timeUnit) {
        return undefined;
    }
    var timeString = timeUnit.toString();
    var dateComponents = [];
    if (timeString.indexOf('year') > -1) {
        dateComponents.push(abbreviated ? '%y' : '%Y');
    }
    if (timeString.indexOf('month') > -1) {
        dateComponents.push(abbreviated ? '%b' : '%B');
    }
    if (timeString.indexOf('day') > -1) {
        dateComponents.push(abbreviated ? '%a' : '%A');
    }
    else if (timeString.indexOf('date') > -1) {
        dateComponents.push('%d');
    }
    var timeComponents = [];
    if (timeString.indexOf('hours') > -1) {
        timeComponents.push('%H');
    }
    if (timeString.indexOf('minutes') > -1) {
        timeComponents.push('%M');
    }
    if (timeString.indexOf('seconds') > -1) {
        timeComponents.push('%S');
    }
    if (timeString.indexOf('milliseconds') > -1) {
        timeComponents.push('%L');
    }
    var out = [];
    if (dateComponents.length > 0) {
        out.push(dateComponents.join('-'));
    }
    if (timeComponents.length > 0) {
        out.push(timeComponents.join(':'));
    }
    return out.length > 0 ? out.join(' ') : undefined;
}
exports.format = format;

},{}],60:[function(require,module,exports){
"use strict";
(function (Type) {
    Type[Type["QUANTITATIVE"] = 'quantitative'] = "QUANTITATIVE";
    Type[Type["ORDINAL"] = 'ordinal'] = "ORDINAL";
    Type[Type["TEMPORAL"] = 'temporal'] = "TEMPORAL";
    Type[Type["NOMINAL"] = 'nominal'] = "NOMINAL";
})(exports.Type || (exports.Type = {}));
var Type = exports.Type;
exports.QUANTITATIVE = Type.QUANTITATIVE;
exports.ORDINAL = Type.ORDINAL;
exports.TEMPORAL = Type.TEMPORAL;
exports.NOMINAL = Type.NOMINAL;
exports.SHORT_TYPE = {
    quantitative: 'Q',
    temporal: 'T',
    nominal: 'N',
    ordinal: 'O'
};
exports.TYPE_FROM_SHORT_TYPE = {
    Q: exports.QUANTITATIVE,
    T: exports.TEMPORAL,
    O: exports.ORDINAL,
    N: exports.NOMINAL
};
function getFullName(type) {
    var typeString = type;
    return exports.TYPE_FROM_SHORT_TYPE[typeString.toUpperCase()] ||
        typeString.toLowerCase();
}
exports.getFullName = getFullName;

},{}],61:[function(require,module,exports){
"use strict";
var stringify = require('json-stable-stringify');
var util_1 = require('datalib/src/util');
exports.keys = util_1.keys;
exports.extend = util_1.extend;
exports.duplicate = util_1.duplicate;
exports.isArray = util_1.isArray;
exports.vals = util_1.vals;
exports.truncate = util_1.truncate;
exports.toMap = util_1.toMap;
exports.isObject = util_1.isObject;
exports.isString = util_1.isString;
exports.isNumber = util_1.isNumber;
exports.isBoolean = util_1.isBoolean;
var generate_1 = require('datalib/src/generate');
exports.range = generate_1.range;
var encoding_1 = require('./encoding');
exports.has = encoding_1.has;
var channel_1 = require('./channel');
exports.Channel = channel_1.Channel;
var util_2 = require('datalib/src/util');
function hash(a) {
    if (util_2.isString(a) || util_2.isNumber(a) || util_2.isBoolean(a)) {
        return String(a);
    }
    return stringify(a);
}
exports.hash = hash;
function contains(array, item) {
    return array.indexOf(item) > -1;
}
exports.contains = contains;
function without(array, excludedItems) {
    return array.filter(function (item) {
        return !contains(excludedItems, item);
    });
}
exports.without = without;
function union(array, other) {
    return array.concat(without(other, array));
}
exports.union = union;
function forEach(obj, f, thisArg) {
    if (obj.forEach) {
        obj.forEach.call(thisArg, f);
    }
    else {
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                f.call(thisArg, obj[k], k, obj);
            }
        }
    }
}
exports.forEach = forEach;
function reduce(obj, f, init, thisArg) {
    if (obj.reduce) {
        return obj.reduce.call(thisArg, f, init);
    }
    else {
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                init = f.call(thisArg, init, obj[k], k, obj);
            }
        }
        return init;
    }
}
exports.reduce = reduce;
function map(obj, f, thisArg) {
    if (obj.map) {
        return obj.map.call(thisArg, f);
    }
    else {
        var output = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                output.push(f.call(thisArg, obj[k], k, obj));
            }
        }
        return output;
    }
}
exports.map = map;
function any(arr, f) {
    var i = 0;
    for (var k = 0; k < arr.length; k++) {
        if (f(arr[k], k, i++)) {
            return true;
        }
    }
    return false;
}
exports.any = any;
function all(arr, f) {
    var i = 0;
    for (var k = 0; k < arr.length; k++) {
        if (!f(arr[k], k, i++)) {
            return false;
        }
    }
    return true;
}
exports.all = all;
function flatten(arrays) {
    return [].concat.apply([], arrays);
}
exports.flatten = flatten;
function mergeDeep(dest) {
    var src = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        src[_i - 1] = arguments[_i];
    }
    for (var i = 0; i < src.length; i++) {
        dest = deepMerge_(dest, src[i]);
    }
    return dest;
}
exports.mergeDeep = mergeDeep;
;
function deepMerge_(dest, src) {
    if (typeof src !== 'object' || src === null) {
        return dest;
    }
    for (var p in src) {
        if (!src.hasOwnProperty(p)) {
            continue;
        }
        if (src[p] === undefined) {
            continue;
        }
        if (typeof src[p] !== 'object' || src[p] === null) {
            dest[p] = src[p];
        }
        else if (typeof dest[p] !== 'object' || dest[p] === null) {
            dest[p] = mergeDeep(src[p].constructor === Array ? [] : {}, src[p]);
        }
        else {
            mergeDeep(dest[p], src[p]);
        }
    }
    return dest;
}
var dlBin = require('datalib/src/bins/bins');
function getbins(stats, maxbins) {
    return dlBin({
        min: stats.min,
        max: stats.max,
        maxbins: maxbins
    });
}
exports.getbins = getbins;
function unique(values, f) {
    var results = [];
    var u = {}, v, i, n;
    for (i = 0, n = values.length; i < n; ++i) {
        v = f ? f(values[i]) : values[i];
        if (v in u) {
            continue;
        }
        u[v] = 1;
        results.push(values[i]);
    }
    return results;
}
exports.unique = unique;
;
function warning(message) {
    console.warn('[VL Warning]', message);
}
exports.warning = warning;
function error(message) {
    console.error('[VL Error]', message);
}
exports.error = error;
function differ(dict, other) {
    for (var key in dict) {
        if (dict.hasOwnProperty(key)) {
            if (other[key] && dict[key] && other[key] !== dict[key]) {
                return true;
            }
        }
    }
    return false;
}
exports.differ = differ;

},{"./channel":14,"./encoding":51,"datalib/src/bins/bins":3,"datalib/src/generate":4,"datalib/src/util":6,"json-stable-stringify":7}],62:[function(require,module,exports){
"use strict";
var util_1 = require('./util');
var mark_1 = require('./mark');
exports.DEFAULT_REQUIRED_CHANNEL_MAP = {
    text: ['text'],
    line: ['x', 'y'],
    area: ['x', 'y']
};
exports.DEFAULT_SUPPORTED_CHANNEL_TYPE = {
    bar: util_1.toMap(['row', 'column', 'x', 'y', 'size', 'color', 'detail']),
    line: util_1.toMap(['row', 'column', 'x', 'y', 'color', 'detail']),
    area: util_1.toMap(['row', 'column', 'x', 'y', 'color', 'detail']),
    tick: util_1.toMap(['row', 'column', 'x', 'y', 'color', 'detail']),
    circle: util_1.toMap(['row', 'column', 'x', 'y', 'color', 'size', 'detail']),
    square: util_1.toMap(['row', 'column', 'x', 'y', 'color', 'size', 'detail']),
    point: util_1.toMap(['row', 'column', 'x', 'y', 'color', 'size', 'detail', 'shape']),
    text: util_1.toMap(['row', 'column', 'size', 'color', 'text'])
};
function getEncodingMappingError(spec, requiredChannelMap, supportedChannelMap) {
    if (requiredChannelMap === void 0) { requiredChannelMap = exports.DEFAULT_REQUIRED_CHANNEL_MAP; }
    if (supportedChannelMap === void 0) { supportedChannelMap = exports.DEFAULT_SUPPORTED_CHANNEL_TYPE; }
    var mark = spec.mark;
    var encoding = spec.encoding;
    var requiredChannels = requiredChannelMap[mark];
    var supportedChannels = supportedChannelMap[mark];
    for (var i in requiredChannels) {
        if (!(requiredChannels[i] in encoding)) {
            return 'Missing encoding channel \"' + requiredChannels[i] +
                '\" for mark \"' + mark + '\"';
        }
    }
    for (var channel in encoding) {
        if (!supportedChannels[channel]) {
            return 'Encoding channel \"' + channel +
                '\" is not supported by mark type \"' + mark + '\"';
        }
    }
    if (mark === mark_1.BAR && !encoding.x && !encoding.y) {
        return 'Missing both x and y for bar';
    }
    return null;
}
exports.getEncodingMappingError = getEncodingMappingError;

},{"./mark":54,"./util":61}],63:[function(require,module,exports){
"use strict";
var util_1 = require('./util');
function isUnionedDomain(domain) {
    if (!util_1.isArray(domain)) {
        return 'fields' in domain;
    }
    return false;
}
exports.isUnionedDomain = isUnionedDomain;
function isDataRefDomain(domain) {
    if (!util_1.isArray(domain)) {
        return 'data' in domain;
    }
    return false;
}
exports.isDataRefDomain = isDataRefDomain;

},{"./util":61}],64:[function(require,module,exports){
"use strict";
var vlBin = require('./bin');
var vlChannel = require('./channel');
var vlConfig = require('./config');
var vlData = require('./data');
var vlEncoding = require('./encoding');
var vlFieldDef = require('./fielddef');
var vlCompile = require('./compile/compile');
var vlShorthand = require('./shorthand');
var vlSpec = require('./spec');
var vlTimeUnit = require('./timeunit');
var vlType = require('./type');
var vlValidate = require('./validate');
var vlUtil = require('./util');
exports.bin = vlBin;
exports.channel = vlChannel;
exports.compile = vlCompile.compile;
exports.config = vlConfig;
exports.data = vlData;
exports.encoding = vlEncoding;
exports.fieldDef = vlFieldDef;
exports.shorthand = vlShorthand;
exports.spec = vlSpec;
exports.timeUnit = vlTimeUnit;
exports.type = vlType;
exports.util = vlUtil;
exports.validate = vlValidate;
exports.version = '1.0.10';

},{"./bin":13,"./channel":14,"./compile/compile":17,"./config":49,"./data":50,"./encoding":51,"./fielddef":52,"./shorthand":56,"./spec":58,"./timeunit":59,"./type":60,"./util":61,"./validate":62}]},{},[64])(64)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1yZXNvbHZlL2VtcHR5LmpzIiwibm9kZV9tb2R1bGVzL2RhdGFsaWIvbm9kZV9tb2R1bGVzL2QzLXRpbWUvYnVpbGQvZDMtdGltZS5qcyIsIm5vZGVfbW9kdWxlcy9kYXRhbGliL3NyYy9iaW5zL2JpbnMuanMiLCJub2RlX21vZHVsZXMvZGF0YWxpYi9zcmMvZ2VuZXJhdGUuanMiLCJub2RlX21vZHVsZXMvZGF0YWxpYi9zcmMvdGltZS5qcyIsIm5vZGVfbW9kdWxlcy9kYXRhbGliL3NyYy91dGlsLmpzIiwibm9kZV9tb2R1bGVzL2pzb24tc3RhYmxlLXN0cmluZ2lmeS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9qc29uLXN0YWJsZS1zdHJpbmdpZnkvbm9kZV9tb2R1bGVzL2pzb25pZnkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvanNvbi1zdGFibGUtc3RyaW5naWZ5L25vZGVfbW9kdWxlcy9qc29uaWZ5L2xpYi9wYXJzZS5qcyIsIm5vZGVfbW9kdWxlcy9qc29uLXN0YWJsZS1zdHJpbmdpZnkvbm9kZV9tb2R1bGVzL2pzb25pZnkvbGliL3N0cmluZ2lmeS5qcyIsInNyYy9hZ2dyZWdhdGUudHMiLCJzcmMvYXhpcy50cyIsInNyYy9iaW4udHMiLCJzcmMvY2hhbm5lbC50cyIsInNyYy9jb21waWxlL2F4aXMudHMiLCJzcmMvY29tcGlsZS9jb21tb24udHMiLCJzcmMvY29tcGlsZS9jb21waWxlLnRzIiwic3JjL2NvbXBpbGUvY29uZmlnLnRzIiwic3JjL2NvbXBpbGUvZGF0YS9iaW4udHMiLCJzcmMvY29tcGlsZS9kYXRhL2NvbG9ycmFuay50cyIsInNyYy9jb21waWxlL2RhdGEvZGF0YS50cyIsInNyYy9jb21waWxlL2RhdGEvZmlsdGVyLnRzIiwic3JjL2NvbXBpbGUvZGF0YS9mb3JtYXRwYXJzZS50cyIsInNyYy9jb21waWxlL2RhdGEvZm9ybXVsYS50cyIsInNyYy9jb21waWxlL2RhdGEvbm9ucG9zaXRpdmVudWxsZmlsdGVyLnRzIiwic3JjL2NvbXBpbGUvZGF0YS9udWxsZmlsdGVyLnRzIiwic3JjL2NvbXBpbGUvZGF0YS9zb3VyY2UudHMiLCJzcmMvY29tcGlsZS9kYXRhL3N0YWNrc2NhbGUudHMiLCJzcmMvY29tcGlsZS9kYXRhL3N1bW1hcnkudHMiLCJzcmMvY29tcGlsZS9kYXRhL3RpbWV1bml0LnRzIiwic3JjL2NvbXBpbGUvZGF0YS90aW1ldW5pdGRvbWFpbi50cyIsInNyYy9jb21waWxlL2ZhY2V0LnRzIiwic3JjL2NvbXBpbGUvbGF5ZXIudHMiLCJzcmMvY29tcGlsZS9sYXlvdXQudHMiLCJzcmMvY29tcGlsZS9sZWdlbmQudHMiLCJzcmMvY29tcGlsZS9tYXJrL2FyZWEudHMiLCJzcmMvY29tcGlsZS9tYXJrL2Jhci50cyIsInNyYy9jb21waWxlL21hcmsvbGluZS50cyIsInNyYy9jb21waWxlL21hcmsvbWFyay50cyIsInNyYy9jb21waWxlL21hcmsvcG9pbnQudHMiLCJzcmMvY29tcGlsZS9tYXJrL3J1bGUudHMiLCJzcmMvY29tcGlsZS9tYXJrL3RleHQudHMiLCJzcmMvY29tcGlsZS9tYXJrL3RpY2sudHMiLCJzcmMvY29tcGlsZS9tb2RlbC50cyIsInNyYy9jb21waWxlL3NjYWxlLnRzIiwic3JjL2NvbXBpbGUvc3RhY2sudHMiLCJzcmMvY29tcGlsZS90aW1lLnRzIiwic3JjL2NvbXBpbGUvdW5pdC50cyIsInNyYy9jb25maWcudHMiLCJzcmMvZGF0YS50cyIsInNyYy9lbmNvZGluZy50cyIsInNyYy9maWVsZGRlZi50cyIsInNyYy9sZWdlbmQudHMiLCJzcmMvbWFyay50cyIsInNyYy9zY2FsZS50cyIsInNyYy9zaG9ydGhhbmQudHMiLCJzcmMvc29ydC50cyIsInNyYy9zcGVjLnRzIiwic3JjL3RpbWV1bml0LnRzIiwic3JjL3R5cGUudHMiLCJzcmMvdXRpbC50cyIsInNyYy92YWxpZGF0ZS50cyIsInNyYy92ZWdhLnNjaGVtYS50cyIsInNyYy92bC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqV0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDeEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNwU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEZBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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LFdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQixRQUFRLENBQUMsTUFBTSxHQUFHLEVBQUUsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsV0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsWUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3BGLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLFFBQVEsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsWUFBRSxDQUFDLENBQUM7UUFDN0MsQ0FBQztJQUNILENBQUM7SUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLFdBQUMsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLFlBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4QyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQixRQUFRLENBQUMsTUFBTSxHQUFHLEVBQUUsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsV0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsWUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3BGLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLFFBQVEsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsWUFBRSxDQUFDLENBQUM7UUFDN0MsQ0FBQztJQUNMLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLFFBQVEsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVELGFBQU0sQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUNyRCxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksS0FBSyxRQUFRLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBQzVFLFFBQVEsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0lBQzFCLENBQUM7SUFHRDtRQUVFLE9BQU87UUFFUCxPQUFPLEVBQUUsTUFBTTtRQUVmLFVBQVUsRUFBRSxNQUFNO1FBRWxCLFNBQVMsRUFBRSxRQUFRO0tBQ3BCLENBQUMsT0FBTyxDQUFDLFVBQVMsUUFBUTtRQUN6QixJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDakUsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDeEIsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUM3QixDQUFDO0lBQ0gsQ0FBQyxDQUFDLENBQUM7SUFFSCxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQ2xCLENBQUM7QUFRRCwrQkFBK0IsS0FBWSxFQUFFLFFBQWtCO0lBQzdELE1BQU0sQ0FBQztRQUNMLElBQUksRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLG9CQUFZLENBQUM7UUFDbkMsSUFBSSxFQUFFLGlCQUFTLENBQUMsT0FBTztRQUN2QixNQUFNLEVBQUU7WUFDTixJQUFJLEVBQUUsS0FBSyxDQUFDLFNBQVMsRUFBRTtZQUV2QixLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxlQUFLLEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBQyxLQUFLLEVBQUUsT0FBTyxFQUFDLENBQUM7WUFDdEYsSUFBSSxFQUFFLElBQUk7U0FDWDtRQUNELEtBQUssRUFBRSxFQUFDLElBQUksRUFBRSxLQUFLLENBQUMsU0FBUyxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsZUFBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBQztLQUN4RSxDQUFDO0FBQ0osQ0FBQztBQUtELGtDQUFrQyxLQUFZLEVBQUUsUUFBa0I7SUFDaEUsTUFBTSxDQUFDO1FBQ0wsSUFBSSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsMEJBQWtCLENBQUM7UUFDekMsSUFBSSxFQUFFLGlCQUFTLENBQUMsT0FBTztRQUN2QixNQUFNLEVBQUU7WUFDTixJQUFJLEVBQUUsS0FBSyxDQUFDLFNBQVMsRUFBRTtZQUN2QixLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxlQUFLLENBQUM7WUFDekIsSUFBSSxFQUFFLElBQUk7U0FDWDtRQUNELEtBQUssRUFBRTtZQUNMLElBQUksRUFBRSxLQUFLLENBQUMsU0FBUyxFQUFFO1lBQ3ZCLEtBQUssRUFBRSxnQkFBSyxDQUFDLFFBQVEsRUFBRSxFQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUMsQ0FBQztZQUM3QyxJQUFJLEVBQUU7Z0JBQ0osS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsZUFBSyxFQUFFLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxDQUFDO2dCQUNsRCxFQUFFLEVBQUUsS0FBSzthQUNWO1NBQ0Y7S0FDRixDQUFDO0FBQ0osQ0FBQztBQUVELG1CQUEwQixLQUFZLEVBQUUsUUFBa0IsRUFBRSxPQUFnQixFQUFFLElBQVU7SUFDdEYsRUFBRSxDQUFDLENBQUMsQ0FBQyxrQkFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUV2QixNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUdELEVBQUUsQ0FBQyxDQUFDLGVBQVEsQ0FBQyxDQUFDLGFBQUcsRUFBRSxnQkFBTSxFQUFFLGVBQUssQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QyxNQUFNLENBQUMsaUJBQVMsQ0FBQyxPQUFPLENBQUM7SUFDM0IsQ0FBQztJQUVELEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztRQUM3QixNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztJQUNwQixDQUFDO0lBRUQsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDdEIsS0FBSyxjQUFPO1lBQ1YsTUFBTSxDQUFDLGlCQUFTLENBQUMsT0FBTyxDQUFDO1FBQzNCLEtBQUssY0FBTztZQUNWLEVBQUUsQ0FBQyxDQUFDLE9BQU8sS0FBSyxlQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUN0QixNQUFNLENBQUMsaUJBQVMsQ0FBQyxNQUFNLENBQUM7WUFDMUIsQ0FBQztZQUNELE1BQU0sQ0FBQyxpQkFBUyxDQUFDLE9BQU8sQ0FBQztRQUMzQixLQUFLLGVBQVE7WUFDWCxFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssZUFBSyxDQUFDLENBQUMsQ0FBQztnQkFDdEIsTUFBTSxDQUFDLGlCQUFTLENBQUMsSUFBSSxDQUFDO1lBQ3hCLENBQUM7WUFFRCxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDdEIsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQzFCLEtBQUssbUJBQVEsQ0FBQyxLQUFLLENBQUM7b0JBQ3BCLEtBQUssbUJBQVEsQ0FBQyxHQUFHLENBQUM7b0JBQ2xCLEtBQUssbUJBQVEsQ0FBQyxLQUFLO3dCQUNqQixNQUFNLENBQUMsaUJBQVMsQ0FBQyxPQUFPLENBQUM7b0JBQzNCO3dCQUVFLE1BQU0sQ0FBQyxpQkFBUyxDQUFDLElBQUksQ0FBQztnQkFDMUIsQ0FBQztZQUNILENBQUM7WUFDRCxNQUFNLENBQUMsaUJBQVMsQ0FBQyxJQUFJLENBQUM7UUFFeEIsS0FBSyxtQkFBWTtZQUNmLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNqQixNQUFNLENBQUMsZUFBUSxDQUFDLENBQUMsV0FBQyxFQUFFLFdBQUMsRUFBRSxlQUFLLENBQUMsRUFBRSxPQUFPLENBQUMsR0FBRyxpQkFBUyxDQUFDLE1BQU0sR0FBRyxpQkFBUyxDQUFDLE9BQU8sQ0FBQztZQUNqRixDQUFDO1lBQ0QsTUFBTSxDQUFDLGlCQUFTLENBQUMsTUFBTSxDQUFDO0lBQzVCLENBQUM7SUFHRCxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQWxEZSxpQkFBUyxZQWtEeEIsQ0FBQTtBQUVELGdCQUF1QixLQUFZLEVBQUUsS0FBWSxFQUFFLE9BQWU7SUFDaEUsSUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUV6QyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztJQUN0QixDQUFDO0lBR0QsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksS0FBSyxlQUFRLENBQUMsQ0FBQyxDQUFDO1FBQy9CLEVBQUUsQ0FBQyxDQUFDLGdCQUFTLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUMsTUFBTSxDQUFDO2dCQUNMLElBQUksRUFBRSxRQUFRLENBQUMsUUFBUTtnQkFDdkIsS0FBSyxFQUFFLE1BQU07YUFDZCxDQUFDO1FBQ0osQ0FBQztRQUVELE1BQU0sQ0FBQztZQUNMLElBQUksRUFBRSxLQUFLLENBQUMsU0FBUyxFQUFFO1lBQ3ZCLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQztZQUMzQixJQUFJLEVBQUU7Z0JBQ0osS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO2dCQUMzQixFQUFFLEVBQUUsS0FBSzthQUNWO1NBQ0YsQ0FBQztJQUNKLENBQUM7SUFHRCxJQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDNUIsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLE9BQU8sS0FBSyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUM1QyxFQUFFLENBQUEsQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLG9CQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUMxQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDaEIsQ0FBQztRQUNELE1BQU0sQ0FBQztZQUNMLElBQUksRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLG9CQUFhLENBQUM7WUFFbkMsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEVBQUMsS0FBSyxFQUFFLE1BQU0sRUFBQyxDQUFDO1NBQzdDLENBQUM7SUFDSixDQUFDO0lBRUQsSUFBTSxZQUFZLEdBQUcsYUFBYSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLEVBQ3pELElBQUksR0FBRyxVQUFVLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFOUMsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUM7WUFDTCxJQUFJLEVBQUUsYUFBTTtZQUNaLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUMsQ0FBQztTQUNqRCxDQUFDO0lBQ0osQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN4QixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLGlCQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUVyQyxNQUFNLENBQUM7Z0JBQ0wsSUFBSSxFQUFFLEtBQUssQ0FBQyxTQUFTLEVBQUU7Z0JBQ3ZCLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsQ0FBQztnQkFDcEQsSUFBSSxFQUFFO29CQUNKLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsQ0FBQztvQkFDcEQsRUFBRSxFQUFFLEtBQUs7aUJBQ1Y7YUFDRixDQUFDO1FBQ0osQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssZUFBSyxDQUFDLENBQUMsQ0FBQztZQUU3QixNQUFNLENBQUM7Z0JBQ0wsSUFBSSxFQUFFLEtBQUssQ0FBQyxTQUFTLEVBQUU7Z0JBQ3ZCLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsQ0FBQzthQUNyRCxDQUFDO1FBQ0osQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBRU4sTUFBTSxDQUFDO2dCQUNMLElBQUksRUFBRSxLQUFLLENBQUMsU0FBUyxFQUFFO2dCQUN2QixLQUFLLEVBQUU7b0JBQ0wsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLENBQUM7b0JBQzdDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxDQUFDO2lCQUM1QzthQUNGLENBQUM7UUFDSixDQUFDO0lBQ0gsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2hCLE1BQU0sQ0FBQztZQUdMLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxHQUFHLGFBQU0sR0FBRyxLQUFLLENBQUMsU0FBUyxFQUFFO1lBQzFDLEtBQUssRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEtBQUssY0FBTyxJQUFJLE9BQU8sS0FBSyxlQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFDLEtBQUssRUFBRSxPQUFPLEVBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO1lBQ3ZILElBQUksRUFBRSxJQUFJO1NBQ1gsQ0FBQztJQUNKLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLE1BQU0sQ0FBQztZQUNMLElBQUksRUFBRSxLQUFLLENBQUMsU0FBUyxFQUFFO1lBQ3ZCLEtBQUssRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEtBQUssY0FBTyxJQUFJLE9BQU8sS0FBSyxlQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFDLEtBQUssRUFBRSxPQUFPLEVBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO1NBQ3hILENBQUM7SUFDSixDQUFDO0FBQ0gsQ0FBQztBQXhGZSxjQUFNLFNBd0ZyQixDQUFBO0FBRUQsb0JBQTJCLEtBQVksRUFBRSxPQUFnQixFQUFFLFNBQW9CO0lBQzdFLEVBQUUsQ0FBQyxDQUFDLFNBQVMsS0FBSyxpQkFBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDcEMsTUFBTSxDQUFDLFNBQVMsQ0FBQztJQUNuQixDQUFDO0lBRUQsSUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNqQyxFQUFFLENBQUMsQ0FBQyxlQUFRLENBQUMsQ0FBQyxXQUFXLEVBQUUsWUFBWSxFQUFFLFNBQVMsQ0FBeUIsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkYsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUM7SUFHRCxFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQzdCLE1BQU0sQ0FBQztZQUNMLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRTtZQUNYLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztTQUNsQixDQUFDO0lBQ0osQ0FBQztJQUdELE1BQU0sQ0FBQyxTQUFTLENBQUM7QUFDbkIsQ0FBQztBQXBCZSxrQkFBVSxhQW9CekIsQ0FBQTtBQVVELHVCQUF3QixLQUFZLEVBQUUsS0FBWSxFQUFFLE9BQWdCO0lBQ2xFLElBQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFekMsTUFBTSxDQUFDLEtBQUssQ0FBQyxZQUFZO1FBRXZCLFFBQVEsQ0FBQyxTQUFTO1FBRWxCLDZCQUFpQixDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztRQUNsRCxDQUtFLENBQUMsUUFBUSxDQUFDLElBQUksS0FBSyxtQkFBWSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztZQUVqRCxDQUFDLFFBQVEsQ0FBQyxJQUFJLEtBQUssZUFBUSxJQUFJLGVBQVEsQ0FBQyxDQUFDLGlCQUFTLENBQUMsSUFBSSxFQUFFLGlCQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQ3RGLENBQUM7QUFDTixDQUFDO0FBR0QscUJBQTRCLEtBQVksRUFBRSxLQUFZLEVBQUUsT0FBZ0I7SUFHdEUsSUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN6QyxJQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDO0lBRXpDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssaUJBQVMsQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDLFFBQVEsSUFBSSxlQUFRLENBQUMsQ0FBQyxXQUFDLEVBQUUsV0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BGLE1BQU0sQ0FBQyxFQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVELEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksQ0FBQyxlQUFRLENBQUMsQ0FBQyxXQUFDLEVBQUUsV0FBQyxFQUFFLGFBQUcsRUFBRSxnQkFBTSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTNELE1BQU0sQ0FBQyxFQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFDLENBQUM7SUFDOUIsQ0FBQztJQUNELE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDaEIsS0FBSyxhQUFHO1lBQ04sTUFBTSxDQUFDLEVBQUMsS0FBSyxFQUFFLFFBQVEsRUFBQyxDQUFDO1FBQzNCLEtBQUssZ0JBQU07WUFDVCxNQUFNLENBQUMsRUFBQyxLQUFLLEVBQUUsT0FBTyxFQUFDLENBQUM7SUFDNUIsQ0FBQztJQUdELElBQU0sU0FBUyxHQUFHLEtBQWtCLENBQUM7SUFDckMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNoQixLQUFLLFdBQUM7WUFJSixNQUFNLENBQUM7Z0JBQ0wsUUFBUSxFQUFFLENBQUM7Z0JBQ1gsUUFBUSxFQUFFLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSzthQUN4QyxDQUFDO1FBQ0osS0FBSyxXQUFDO1lBQ0osTUFBTSxDQUFDO2dCQUNMLFFBQVEsRUFBRSxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU07Z0JBQ3hDLFFBQVEsRUFBRSxDQUFDO2FBQ1osQ0FBQztRQUNKLEtBQUssY0FBSTtZQUVQLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxVQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUM3QixFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsWUFBWSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7b0JBQzNDLE1BQU0sQ0FBQyxFQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsWUFBWSxFQUFDLENBQUM7Z0JBQzNDLENBQUM7Z0JBQ0QsSUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssWUFBWSxHQUFHLFdBQUMsR0FBRyxXQUFDLENBQUM7Z0JBQ3RFLE1BQU0sQ0FBQyxFQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUMsQ0FBQztZQUNyRixDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxXQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUMxQyxNQUFNLENBQUMsRUFBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQzdDLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxLQUFLLFdBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3JDLE1BQU0sQ0FBQyxFQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDN0MsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEtBQUssV0FBSSxDQUFDLENBQUMsQ0FBQztnQkFDckMsTUFBTSxDQUFDLEVBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUM3QyxDQUFDO1lBRUQsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLGNBQWMsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUM3QyxNQUFNLENBQUMsRUFBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLGNBQWMsRUFBQyxDQUFDO1lBQzdDLENBQUM7WUFFRCxJQUFNLFFBQVEsR0FBRyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFMUMsTUFBTSxDQUFDLEVBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQztRQUN2RCxLQUFLLGVBQUs7WUFDUixNQUFNLENBQUMsRUFBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLFVBQVUsRUFBQyxDQUFD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QUFLLENBQUM7QUFDWixlQUFPLEdBQUcsU0FBUyxDQUFDO0FBQ3BCLGVBQU8sR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDO0FBQzVCLGNBQU0sR0FBRyxRQUFRLENBQUM7QUFDbEIsWUFBSSxHQUFHLE1BQU0sQ0FBQztBQUNkLGdCQUFRLEdBQUcsVUFBVSxDQUFDO0FBQ3RCLGdCQUFRLEdBQUcsVUFBVSxDQUFDO0FBQ3RCLGlCQUFTLEdBQUcsV0FBVyxDQUFDO0FBQ3hCLFlBQUksR0FBRyxNQUFNLENBQUM7QUFDZCxnQkFBUSxHQUFHLFVBQVUsQ0FBQztBQUN0QixZQUFJLEdBQUcsTUFBTSxDQUFDO0FBQ2QsWUFBSSxHQUFHLE1BQU0sQ0FBQztBQUNkLGdCQUFRLEdBQUcsVUFBVSxDQUFDO0FBRXRCLGVBQU8sR0FBRyxhQUFhLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiIiwiKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gZmFjdG9yeShleHBvcnRzKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZSgnZDMtdGltZScsIFsnZXhwb3J0cyddLCBmYWN0b3J5KSA6XG4gIGZhY3RvcnkoKGdsb2JhbC5kM190aW1lID0ge30pKTtcbn0odGhpcywgZnVuY3Rpb24gKGV4cG9ydHMpIHsgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciB0MCA9IG5ldyBEYXRlO1xuICB2YXIgdDEgPSBuZXcgRGF0ZTtcbiAgZnVuY3Rpb24gbmV3SW50ZXJ2YWwoZmxvb3JpLCBvZmZzZXRpLCBjb3VudCwgZmllbGQpIHtcblxuICAgIGZ1bmN0aW9uIGludGVydmFsKGRhdGUpIHtcbiAgICAgIHJldHVybiBmbG9vcmkoZGF0ZSA9IG5ldyBEYXRlKCtkYXRlKSksIGRhdGU7XG4gICAgfVxuXG4gICAgaW50ZXJ2YWwuZmxvb3IgPSBpbnRlcnZhbDtcblxuICAgIGludGVydmFsLnJvdW5kID0gZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgdmFyIGQwID0gbmV3IERhdGUoK2RhdGUpLFxuICAgICAgICAgIGQxID0gbmV3IERhdGUoZGF0ZSAtIDEpO1xuICAgICAgZmxvb3JpKGQwKSwgZmxvb3JpKGQxKSwgb2Zmc2V0aShkMSwgMSk7XG4gICAgICByZXR1cm4gZGF0ZSAtIGQwIDwgZDEgLSBkYXRlID8gZDAgOiBkMTtcbiAgICB9O1xuXG4gICAgaW50ZXJ2YWwuY2VpbCA9IGZ1bmN0aW9uKGRhdGUpIHtcbiAgICAgIHJldHVybiBmbG9vcmkoZGF0ZSA9IG5ldyBEYXRlKGRhdGUgLSAxKSksIG9mZnNldGkoZGF0ZSwgMSksIGRhdGU7XG4gICAgfTtcblxuICAgIGludGVydmFsLm9mZnNldCA9IGZ1bmN0aW9uKGRhdGUsIHN0ZXApIHtcbiAgICAgIHJldHVybiBvZmZzZXRpKGRhdGUgPSBuZXcgRGF0ZSgrZGF0ZSksIHN0ZXAgPT0gbnVsbCA/IDEgOiBNYXRoLmZsb29yKHN0ZXApKSwgZGF0ZTtcbiAgICB9O1xuXG4gICAgaW50ZXJ2YWwucmFuZ2UgPSBmdW5jdGlvbihzdGFydCwgc3RvcCwgc3RlcCkge1xuICAgICAgdmFyIHJhbmdlID0gW107XG4gICAgICBzdGFydCA9IG5ldyBEYXRlKHN0YXJ0IC0gMSk7XG4gICAgICBzdG9wID0gbmV3IERhdGUoK3N0b3ApO1xuICAgICAgc3RlcCA9IHN0ZXAgPT0gbnVsbCA/IDEgOiBNYXRoLmZsb29yKHN0ZXApO1xuICAgICAgaWYgKCEoc3RhcnQgPCBzdG9wKSB8fCAhKHN0ZXAgPiAwKSkgcmV0dXJuIHJhbmdlOyAvLyBhbHNvIGhhbmRsZXMgSW52YWxpZCBEYXRlXG4gICAgICBvZmZzZXRpKHN0YXJ0LCAxKSwgZmxvb3JpKHN0YXJ0KTtcbiAgICAgIGlmIChzdGFydCA8IHN0b3ApIHJhbmdlLnB1c2gobmV3IERhdGUoK3N0YXJ0KSk7XG4gICAgICB3aGlsZSAob2Zmc2V0aShzdGFydCwgc3RlcCksIGZsb29yaShzdGFydCksIHN0YXJ0IDwgc3RvcCkgcmFuZ2UucHVzaChuZXcgRGF0ZSgrc3RhcnQpKTtcbiAgICAgIHJldHVybiByYW5nZTtcbiAgICB9O1xuXG4gICAgaW50ZXJ2YWwuZmlsdGVyID0gZnVuY3Rpb24odGVzdCkge1xuICAgICAgcmV0dXJuIG5ld0ludGVydmFsKGZ1bmN0aW9uKGRhdGUpIHtcbiAgICAgICAgd2hpbGUgKGZsb29yaShkYXRlKSwgIXRlc3QoZGF0ZSkpIGRhdGUuc2V0VGltZShkYXRlIC0gMSk7XG4gICAgICB9LCBmdW5jdGlvbihkYXRlLCBzdGVwKSB7XG4gICAgICAgIHdoaWxlICgtLXN0ZXAgPj0gMCkgd2hpbGUgKG9mZnNldGkoZGF0ZSwgMSksICF0ZXN0KGRhdGUpKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBpZiAoY291bnQpIHtcbiAgICAgIGludGVydmFsLmNvdW50ID0gZnVuY3Rpb24oc3RhcnQsIGVuZCkge1xuICAgICAgICB0MC5zZXRUaW1lKCtzdGFydCksIHQxLnNldFRpbWUoK2VuZCk7XG4gICAgICAgIGZsb29yaSh0MCksIGZsb29yaSh0MSk7XG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKGNvdW50KHQwLCB0MSkpO1xuICAgICAgfTtcblxuICAgICAgaW50ZXJ2YWwuZXZlcnkgPSBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgIHN0ZXAgPSBNYXRoLmZsb29yKHN0ZXApO1xuICAgICAgICByZXR1cm4gIWlzRmluaXRlKHN0ZXApIHx8ICEoc3RlcCA+IDApID8gbnVsbFxuICAgICAgICAgICAgOiAhKHN0ZXAgPiAxKSA/IGludGVydmFsXG4gICAgICAgICAgICA6IGludGVydmFsLmZpbHRlcihmaWVsZFxuICAgICAgICAgICAgICAgID8gZnVuY3Rpb24oZCkgeyByZXR1cm4gZmllbGQoZCkgJSBzdGVwID09PSAwOyB9XG4gICAgICAgICAgICAgICAgOiBmdW5jdGlvbihkKSB7IHJldHVybiBpbnRlcnZhbC5jb3VudCgwLCBkKSAlIHN0ZXAgPT09IDA7IH0pO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gaW50ZXJ2YWw7XG4gIH07XG5cbiAgdmFyIG1pbGxpc2Vjb25kID0gbmV3SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgLy8gbm9vcFxuICB9LCBmdW5jdGlvbihkYXRlLCBzdGVwKSB7XG4gICAgZGF0ZS5zZXRUaW1lKCtkYXRlICsgc3RlcCk7XG4gIH0sIGZ1bmN0aW9uKHN0YXJ0LCBlbmQpIHtcbiAgICByZXR1cm4gZW5kIC0gc3RhcnQ7XG4gIH0pO1xuXG4gIC8vIEFuIG9wdGltaXplZCBpbXBsZW1lbnRhdGlvbiBmb3IgdGhpcyBzaW1wbGUgY2FzZS5cbiAgbWlsbGlzZWNvbmQuZXZlcnkgPSBmdW5jdGlvbihrKSB7XG4gICAgayA9IE1hdGguZmxvb3Ioayk7XG4gICAgaWYgKCFpc0Zpbml0ZShrKSB8fCAhKGsgPiAwKSkgcmV0dXJuIG51bGw7XG4gICAgaWYgKCEoayA+IDEpKSByZXR1cm4gbWlsbGlzZWNvbmQ7XG4gICAgcmV0dXJuIG5ld0ludGVydmFsKGZ1bmN0aW9uKGRhdGUpIHtcbiAgICAgIGRhdGUuc2V0VGltZShNYXRoLmZsb29yKGRhdGUgLyBrKSAqIGspO1xuICAgIH0sIGZ1bmN0aW9uKGRhdGUsIHN0ZXApIHtcbiAgICAgIGRhdGUuc2V0VGltZSgrZGF0ZSArIHN0ZXAgKiBrKTtcbiAgICB9LCBmdW5jdGlvbihzdGFydCwgZW5kKSB7XG4gICAgICByZXR1cm4gKGVuZCAtIHN0YXJ0KSAvIGs7XG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIHNlY29uZCA9IG5ld0ludGVydmFsKGZ1bmN0aW9uKGRhdGUpIHtcbiAgICBkYXRlLnNldE1pbGxpc2Vjb25kcygwKTtcbiAgfSwgZnVuY3Rpb24oZGF0ZSwgc3RlcCkge1xuICAgIGRhdGUuc2V0VGltZSgrZGF0ZSArIHN0ZXAgKiAxZTMpO1xuICB9LCBmdW5jdGlvbihzdGFydCwgZW5kKSB7XG4gICAgcmV0dXJuIChlbmQgLSBzdGFydCkgLyAxZTM7XG4gIH0sIGZ1bmN0aW9uKGRhdGUpIHtcbiAgICByZXR1cm4gZGF0ZS5nZXRTZWNvbmRzKCk7XG4gIH0pO1xuXG4gIHZhciBtaW51dGUgPSBuZXdJbnRlcnZhbChmdW5jdGlvbihkYXRlKSB7XG4gICAgZGF0ZS5zZXRTZWNvbmRzKDAsIDApO1xuICB9LCBmdW5jdGlvbihkYXRlLCBzdGVwKSB7XG4gICAgZGF0ZS5zZXRUaW1lKCtkYXRlICsgc3RlcCAqIDZlNCk7XG4gIH0sIGZ1bmN0aW9uKHN0YXJ0LCBlbmQpIHtcbiAgICByZXR1cm4gKGVuZCAtIHN0YXJ0KSAvIDZlNDtcbiAgfSwgZnVuY3Rpb24oZGF0ZSkge1xuICAgIHJldHVybiBkYXRlLmdldE1pbnV0ZXMoKTtcbiAgfSk7XG5cbiAgdmFyIGhvdXIgPSBuZXdJbnRlcnZhbChmdW5jdGlvbihkYXRlKSB7XG4gICAgZGF0ZS5zZXRNaW51dGVzKDAsIDAsIDApO1xuICB9LCBmdW5jdGlvbihkYXRlLCBzdGVwKSB7XG4gICAgZGF0ZS5zZXRUaW1lKCtkYXRlICsgc3RlcCAqIDM2ZTUpO1xuICB9LCBmdW5jdGlvbihzdGFydCwgZW5kKSB7XG4gICAgcmV0dXJuIChlbmQgLSBzdGFydCkgLyAzNmU1O1xuICB9LCBmdW5jdGlvbihkYXRlKSB7XG4gICAgcmV0dXJuIGRhdGUuZ2V0SG91cnMoKTtcbiAgfSk7XG5cbiAgdmFyIGRheSA9IG5ld0ludGVydmFsKGZ1bmN0aW9uKGRhdGUpIHtcbiAgICBkYXRlLnNldEhvdXJzKDAsIDAsIDAsIDApO1xuICB9LCBmdW5jdGlvbihkYXRlLCBzdGVwKSB7XG4gICAgZGF0ZS5zZXREYXRlKGRhdGUuZ2V0RGF0ZSgpICsgc3RlcCk7XG4gIH0sIGZ1bmN0aW9uKHN0YXJ0LCBlbmQpIHtcbiAgICByZXR1cm4gKGVuZCAtIHN0YXJ0IC0gKGVuZC5nZXRUaW1lem9uZU9mZnNldCgpIC0gc3RhcnQuZ2V0VGltZXpvbmVPZmZzZXQoKSkgKiA2ZTQpIC8gODY0ZTU7XG4gIH0sIGZ1bmN0aW9uKGRhdGUpIHtcbiAgICByZXR1cm4gZGF0ZS5nZXREYXRlKCkgLSAxO1xuICB9KTtcblxuICBmdW5jdGlvbiB3ZWVrZGF5KGkpIHtcbiAgICByZXR1cm4gbmV3SW50ZXJ2YWwoZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgZGF0ZS5zZXRIb3VycygwLCAwLCAwLCAwKTtcbiAgICAgIGRhdGUuc2V0RGF0ZShkYXRlLmdldERhdGUoKSAtIChkYXRlLmdldERheSgpICsgNyAtIGkpICUgNyk7XG4gICAgfSwgZnVuY3Rpb24oZGF0ZSwgc3RlcCkge1xuICAgICAgZGF0ZS5zZXREYXRlKGRhdGUuZ2V0RGF0ZSgpICsgc3RlcCAqIDcpO1xuICAgIH0sIGZ1bmN0aW9uKHN0YXJ0LCBlbmQpIHtcbiAgICAgIHJldHVybiAoZW5kIC0gc3RhcnQgLSAoZW5kLmdldFRpbWV6b25lT2Zmc2V0KCkgLSBzdGFydC5nZXRUaW1lem9uZU9mZnNldCgpKSAqIDZlNCkgLyA2MDQ4ZTU7XG4gICAgfSk7XG4gIH1cblxuICB2YXIgc3VuZGF5ID0gd2Vla2RheSgwKTtcbiAgdmFyIG1vbmRheSA9IHdlZWtkYXkoMSk7XG4gIHZhciB0dWVzZGF5ID0gd2Vla2RheSgyKTtcbiAgdmFyIHdlZG5lc2RheSA9IHdlZWtkYXkoMyk7XG4gIHZhciB0aHVyc2RheSA9IHdlZWtkYXkoNCk7XG4gIHZhciBmcmlkYXkgPSB3ZWVrZGF5KDUpO1xuICB2YXIgc2F0dXJkYXkgPSB3ZWVrZGF5KDYpO1xuXG4gIHZhciBtb250aCA9IG5ld0ludGVydmFsKGZ1bmN0aW9uKGRhdGUpIHtcbiAgICBkYXRlLnNldEhvdXJzKDAsIDAsIDAsIDApO1xuICAgIGRhdGUuc2V0RGF0ZSgxKTtcbiAgfSwgZnVuY3Rpb24oZGF0ZSwgc3RlcCkge1xuICAgIGRhdGUuc2V0TW9udGgoZGF0ZS5nZXRNb250aCgpICsgc3RlcCk7XG4gIH0sIGZ1bmN0aW9uKHN0YXJ0LCBlbmQpIHtcbiAgICByZXR1cm4gZW5kLmdldE1vbnRoKCkgLSBzdGFydC5nZXRNb250aCgpICsgKGVuZC5nZXRGdWxsWWVhcigpIC0gc3RhcnQuZ2V0RnVsbFllYXIoKSkgKiAxMjtcbiAgfSwgZnVuY3Rpb24oZGF0ZSkge1xuICAgIHJldHVybiBkYXRlLmdldE1vbnRoKCk7XG4gIH0pO1xuXG4gIHZhciB5ZWFyID0gbmV3SW50ZXJ2YWwoZnVuY3Rpb24oZGF0ZSkge1xuICAgIGRhdGUuc2V0SG91cnMoMCwgMCwgMCwgMCk7XG4gICAgZGF0ZS5zZXRNb250aCgwLCAxKTtcbiAgfSwgZnVuY3Rpb24oZGF0ZSwgc3RlcCkge1xuICAgIGRhdGUuc2V0RnVsbFllYXIoZGF0ZS5nZXRGdWxsWWVhcigpICsgc3RlcCk7XG4gIH0sIGZ1bmN0aW9uKHN0YXJ0LCBlbmQpIHtcbiAgICByZXR1cm4gZW5kLmdldEZ1bGxZZWFyKCkgLSBzdGFydC5nZXRGdWxsWWVhcigpO1xuICB9LCBmdW5jdGlvbihkYXRlKSB7XG4gICAgcmV0dXJuIGRhdGUuZ2V0RnVsbFllYXIoKTtcbiAgfSk7XG5cbiAgdmFyIHV0Y1NlY29uZCA9IG5ld0ludGVydmFsKGZ1bmN0aW9uKGRhdGUpIHtcbiAgICBkYXRlLnNldFVUQ01pbGxpc2Vjb25kcygwKTtcbiAgfSwgZnVuY3Rpb24oZGF0ZSwgc3RlcCkge1xuICAgIGRhdGUuc2V0VGltZSgrZGF0ZSArIHN0ZXAgKiAxZTMpO1xuICB9LCBmdW5jdGlvbihzdGFydCwgZW5kKSB7XG4gICAgcmV0dXJuIChlbmQgLSBzdGFydCkgLyAxZTM7XG4gIH0sIGZ1bmN0aW9uKGRhdGUpIHtcbiAgICByZXR1cm4gZGF0ZS5nZXRVVENTZWNvbmRzKCk7XG4gIH0pO1xuXG4gIHZhciB1dGNNaW51dGUgPSBuZXdJbnRlcnZhbChmdW5jdGlvbihkYXRlKSB7XG4gICAgZGF0ZS5zZXRVVENTZWNvbmRzKDAsIDApO1xuICB9LCBmdW5jdGlvbihkYXRlLCBzdGVwKSB7XG4gICAgZGF0ZS5zZXRUaW1lKCtkYXRlICsgc3RlcCAqIDZlNCk7XG4gIH0sIGZ1bmN0aW9uKHN0YXJ0LCBlbmQpIHtcbiAgICByZXR1cm4gKGVuZCAtIHN0YXJ0KSAvIDZlNDtcbiAgfSwgZnVuY3Rpb24oZGF0ZSkge1xuICAgIHJldHVybiBkYXRlLmdldFVUQ01pbnV0ZXMoKTtcbiAgfSk7XG5cbiAgdmFyIHV0Y0hvdXIgPSBuZXdJbnRlcnZhbChmdW5jdGlvbihkYXRlKSB7XG4gICAgZGF0ZS5zZXRVVENNaW51dGVzKDAsIDAsIDApO1xuICB9LCBmdW5jdGlvbihkYXRlLCBzdGVwKSB7XG4gICAgZGF0ZS5zZXRUaW1lKCtkYXRlICsgc3RlcCAqIDM2ZTUpO1xuICB9LCBmdW5jdGlvbihzdGFydCwgZW5kKSB7XG4gICAgcmV0dXJuIChlbmQgLSBzdGFydCkgLyAzNmU1O1xuICB9LCBmdW5jdGlvbihkYXRlKSB7XG4gICAgcmV0dXJuIGRhdGUuZ2V0VVRDSG91cnMoKTtcbiAgfSk7XG5cbiAgdmFyIHV0Y0RheSA9IG5ld0ludGVydmFsKGZ1bmN0aW9uKGRhdGUpIHtcbiAgICBkYXRlLnNldFVUQ0hvdXJzKDAsIDAsIDAsIDApO1xuICB9LCBmdW5jdGlvbihkYXRlLCBzdGVwKSB7XG4gICAgZGF0ZS5zZXRVVENEYXRlKGRhdGUuZ2V0VVRDRGF0ZSgpICsgc3RlcCk7XG4gIH0sIGZ1bmN0aW9uKHN0YXJ0LCBlbmQpIHtcbiAgICByZXR1cm4gKGVuZCAtIHN0YXJ0KSAvIDg2NGU1O1xuICB9LCBmdW5jdGlvbihkYXRlKSB7XG4gICAgcmV0dXJuIGRhdGUuZ2V0VVRDRGF0ZSgpIC0gMTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gdXRjV2Vla2RheShpKSB7XG4gICAgcmV0dXJuIG5ld0ludGVydmFsKGZ1bmN0aW9uKGRhdGUpIHtcbiAgICAgIGRhdGUuc2V0VVRDSG91cnMoMCwgMCwgMCwgMCk7XG4gICAgICBkYXRlLnNldFVUQ0RhdGUoZGF0ZS5nZXRVVENEYXRlKCkgLSAoZGF0ZS5nZXRVVENEYXkoKSArIDcgLSBpKSAlIDcpO1xuICAgIH0sIGZ1bmN0aW9uKGRhdGUsIHN0ZXApIHtcbiAgICAgIGRhdGUuc2V0VVRDRGF0ZShkYXRlLmdldFVUQ0RhdGUoKSArIHN0ZXAgKiA3KTtcbiAgICB9LCBmdW5jdGlvbihzdGFydCwgZW5kKSB7XG4gICAgICByZXR1cm4gKGVuZCAtIHN0YXJ0KSAvIDYwNDhlNTtcbiAgICB9KTtcbiAgfVxuXG4gIHZhciB1dGNTdW5kYXkgPSB1dGNXZWVrZGF5KDApO1xuICB2YXIgdXRjTW9uZGF5ID0gdXRjV2Vla2RheSgxKTtcbiAgdmFyIHV0Y1R1ZXNkYXkgPSB1dGNXZWVrZGF5KDIpO1xuICB2YXIgdXRjV2VkbmVzZGF5ID0gdXRjV2Vla2RheSgzKTtcbiAgdmFyIHV0Y1RodXJzZGF5ID0gdXRjV2Vla2RheSg0KTtcbiAgdmFyIHV0Y0ZyaWRheSA9IHV0Y1dlZWtkYXkoNSk7XG4gIHZhciB1dGNTYXR1cmRheSA9IHV0Y1dlZWtkYXkoNik7XG5cbiAgdmFyIHV0Y01vbnRoID0gbmV3SW50ZXJ2YWwoZnVuY3Rpb24oZGF0ZSkge1xuICAgIGRhdGUuc2V0VVRDSG91cnMoMCwgMCwgMCwgMCk7XG4gICAgZGF0ZS5zZXRVVENEYXRlKDEpO1xuICB9LCBmdW5jdGlvbihkYXRlLCBzdGVwKSB7XG4gICAgZGF0ZS5zZXRVVENNb250aChkYXRlLmdldFVUQ01vbnRoKCkgKyBzdGVwKTtcbiAgfSwgZnVuY3Rpb24oc3RhcnQsIGVuZCkge1xuICAgIHJldHVybiBlbmQuZ2V0VVRDTW9udGgoKSAtIHN0YXJ0LmdldFVUQ01vbnRoKCkgKyAoZW5kLmdldFVUQ0Z1bGxZZWFyKCkgLSBzdGFydC5nZXRVVENGdWxsWWVhcigpKSAqIDEyO1xuICB9LCBmdW5jdGlvbihkYXRlKSB7XG4gICAgcmV0dXJuIGRhdGUuZ2V0VVRDTW9udGgoKTtcbiAgfSk7XG5cbiAgdmFyIHV0Y1llYXIgPSBuZXdJbnRlcnZhbChmdW5jdGlvbihkYXRlKSB7XG4gICAgZGF0ZS5zZXRVVENIb3VycygwLCAwLCAwLCAwKTtcbiAgICBkYXRlLnNldFVUQ01vbnRoKDAsIDEpO1xuICB9LCBmdW5jdGlvbihkYXRlLCBzdGVwKSB7XG4gICAgZGF0ZS5zZXRVVENGdWxsWWVhcihkYXRlLmdldFVUQ0Z1bGxZZWFyKCkgKyBzdGVwKTtcbiAgfSwgZnVuY3Rpb24oc3RhcnQsIGVuZCkge1xuICAgIHJldHVybiBlbmQuZ2V0VVRDRnVsbFllYXIoKSAtIHN0YXJ0LmdldFVUQ0Z1bGxZZWFyKCk7XG4gIH0sIGZ1bmN0aW9uKGRhdGUpIHtcbiAgICByZXR1cm4gZGF0ZS5nZXRVVENGdWxsWWVhcigpO1xuICB9KTtcblxuICB2YXIgbWlsbGlzZWNvbmRzID0gbWlsbGlzZWNvbmQucmFuZ2U7XG4gIHZhciBzZWNvbmRzID0gc2Vjb25kLnJhbmdlO1xuICB2YXIgbWludXRlcyA9IG1pbnV0ZS5yYW5nZTtcbiAgdmFyIGhvdXJzID0gaG91ci5yYW5nZTtcbiAgdmFyIGRheXMgPSBkYXkucmFuZ2U7XG4gIHZhciBzdW5kYXlzID0gc3VuZGF5LnJhbmdlO1xuICB2YXIgbW9uZGF5cyA9IG1vbmRheS5yYW5nZTtcbiAgdmFyIHR1ZXNkYXlzID0gdHVlc2RheS5yYW5nZTtcbiAgdmFyIHdlZG5lc2RheXMgPSB3ZWRuZXNkYXkucmFuZ2U7XG4gIHZhciB0aHVyc2RheXMgPSB0aHVyc2RheS5yYW5nZTtcbiAgdmFyIGZyaWRheXMgPSBmcmlkYXkucmFuZ2U7XG4gIHZhciBzYXR1cmRheXMgPSBzYXR1cmRheS5yYW5nZTtcbiAgdmFyIHdlZWtzID0gc3VuZGF5LnJhbmdlO1xuICB2YXIgbW9udGhzID0gbW9udGgucmFuZ2U7XG4gIHZhciB5ZWFycyA9IHllYXIucmFuZ2U7XG5cbiAgdmFyIHV0Y01pbGxpc2Vjb25kID0gbWlsbGlzZWNvbmQ7XG4gIHZhciB1dGNNaWxsaXNlY29uZHMgPSBtaWxsaXNlY29uZHM7XG4gIHZhciB1dGNTZWNvbmRzID0gdXRjU2Vjb25kLnJhbmdlO1xuICB2YXIgdXRjTWludXRlcyA9IHV0Y01pbnV0ZS5yYW5nZTtcbiAgdmFyIHV0Y0hvdXJzID0gdXRjSG91ci5yYW5nZTtcbiAgdmFyIHV0Y0RheXMgPSB1dGNEYXkucmFuZ2U7XG4gIHZhciB1dGNTdW5kYXlzID0gdXRjU3VuZGF5LnJhbmdlO1xuICB2YXIgdXRjTW9uZGF5cyA9IHV0Y01vbmRheS5yYW5nZTtcbiAgdmFyIHV0Y1R1ZXNkYXlzID0gdXRjVHVlc2RheS5yYW5nZTtcbiAgdmFyIHV0Y1dlZG5lc2RheXMgPSB1dGNXZWRuZXNkYXkucmFuZ2U7XG4gIHZhciB1dGNUaHVyc2RheXMgPSB1dGNUaHVyc2RheS5yYW5nZTtcbiAgdmFyIHV0Y0ZyaWRheXMgPSB1dGNGcmlkYXkucmFuZ2U7XG4gIHZhciB1dGNTYXR1cmRheXMgPSB1dGNTYXR1cmRheS5yYW5nZTtcbiAgdmFyIHV0Y1dlZWtzID0gdXRjU3VuZGF5LnJhbmdlO1xuICB2YXIgdXRjTW9udGhzID0gdXRjTW9udGgucmFuZ2U7XG4gIHZhciB1dGNZZWFycyA9IHV0Y1llYXIucmFuZ2U7XG5cbiAgdmFyIHZlcnNpb24gPSBcIjAuMS4xXCI7XG5cbiAgZXhwb3J0cy52ZXJzaW9uID0gdmVyc2lvbjtcbiAgZXhwb3J0cy5taWxsaXNlY29uZHMgPSBtaWxsaXNlY29uZHM7XG4gIGV4cG9ydHMuc2Vjb25kcyA9IHNlY29uZHM7XG4gIGV4cG9ydHMubWludXRlcyA9IG1pbnV0ZXM7XG4gIGV4cG9ydHMuaG91cnMgPSBob3VycztcbiAgZXhwb3J0cy5kYXlzID0gZGF5cztcbiAgZXhwb3J0cy5zdW5kYXlzID0gc3VuZGF5cztcbiAgZXhwb3J0cy5tb25kYXlzID0gbW9uZGF5cztcbiAgZXhwb3J0cy50dWVzZGF5cyA9IHR1ZXNkYXlzO1xuICBleHBvcnRzLndlZG5lc2RheXMgPSB3ZWRuZXNkYXlzO1xuICBleHBvcnRzLnRodXJzZGF5cyA9IHRodXJzZGF5cztcbiAgZXhwb3J0cy5mcmlkYXlzID0gZnJpZGF5cztcbiAgZXhwb3J0cy5zYXR1cmRheXMgPSBzYXR1cmRheXM7XG4gIGV4cG9ydHMud2Vla3MgPSB3ZWVrcztcbiAgZXhwb3J0cy5tb250aHMgPSBtb250aHM7XG4gIGV4cG9ydHMueWVhcnMgPSB5ZWFycztcbiAgZXhwb3J0cy51dGNNaWxsaXNlY29uZCA9IHV0Y01pbGxpc2Vjb25kO1xuICBleHBvcnRzLnV0Y01pbGxpc2Vjb25kcyA9IHV0Y01pbGxpc2Vjb25kcztcbiAgZXhwb3J0cy51dGNTZWNvbmRzID0gdXRjU2Vjb25kcztcbiAgZXhwb3J0cy51dGNNaW51dGVzID0gdXRjTWludXRlcztcbiAgZXhwb3J0cy51dGNIb3VycyA9IHV0Y0hvdXJzO1xuICBleHBvcnRzLnV0Y0RheXMgPSB1dGNEYXlzO1xuICBleHBvcnRzLnV0Y1N1bmRheXMgPSB1dGNTdW5kYXlzO1xuICBleHBvcnRzLnV0Y01vbmRheXMgPSB1dGNNb25kYXlzO1xuICBleHBvcnRzLnV0Y1R1ZXNkYXlzID0gdXRjVHVlc2RheXM7XG4gIGV4cG9ydHMudXRjV2VkbmVzZGF5cyA9IHV0Y1dlZG5lc2RheXM7XG4gIGV4cG9ydHMudXRjVGh1cnNkYXlzID0gdXRjVGh1cnNkYXlzO1xuICBleHBvcnRzLnV0Y0ZyaWRheXMgPSB1dGNGcmlkYXlzO1xuICBleHBvcnRzLnV0Y1NhdHVyZGF5cyA9IHV0Y1NhdHVyZGF5cztcbiAgZXhwb3J0cy51dGNXZWVrcyA9IHV0Y1dlZWtzO1xuICBleHBvcnRzLnV0Y01vbnRocyA9IHV0Y01vbnRocztcbiAgZXhwb3J0cy51dGNZZWFycyA9IHV0Y1llYXJzO1xuICBleHBvcnRzLm1pbGxpc2Vjb25kID0gbWlsbGlzZWNvbmQ7XG4gIGV4cG9ydHMuc2Vjb25kID0gc2Vjb25kO1xuICBleHBvcnRzLm1pbnV0ZSA9IG1pbnV0ZTtcbiAgZXhwb3J0cy5ob3VyID0gaG91cjtcbiAgZXhwb3J0cy5kYXkgPSBkYXk7XG4gIGV4cG9ydHMuc3VuZGF5ID0gc3VuZGF5O1xuICBleHBvcnRzLm1vbmRheSA9IG1vbmRheTtcbiAgZXhwb3J0cy50dWVzZGF5ID0gdHVlc2RheTtcbiAgZXhwb3J0cy53ZWRuZXNkYXkgPSB3ZWRuZXNkYXk7XG4gIGV4cG9ydHMudGh1cnNkYXkgPSB0aHVyc2RheTtcbiAgZXhwb3J0cy5mcmlkYXkgPSBmcmlkYXk7XG4gIGV4cG9ydHMuc2F0dXJkYXkgPSBzYXR1cmRheTtcbiAgZXhwb3J0cy53ZWVrID0gc3VuZGF5O1xuICBleHBvcnRzLm1vbnRoID0gbW9udGg7XG4gIGV4cG9ydHMueWVhciA9IHllYXI7XG4gIGV4cG9ydHMudXRjU2Vjb25kID0gdXRjU2Vjb25kO1xuICBleHBvcnRzLnV0Y01pbnV0ZSA9IHV0Y01pbnV0ZTtcbiAgZXhwb3J0cy51dGNIb3VyID0gdXRjSG91cjtcbiAgZXhwb3J0cy51dGNEYXkgPSB1dGNEYXk7XG4gIGV4cG9ydHMudXRjU3VuZGF5ID0gdXRjU3VuZGF5O1xuICBleHBvcnRzLnV0Y01vbmRheSA9IHV0Y01vbmRheTtcbiAgZXhwb3J0cy51dGNUdWVzZGF5ID0gdXRjVHVlc2RheTtcbiAgZXhwb3J0cy51dGNXZWRuZXNkYXkgPSB1dGNXZWRuZXNkYXk7XG4gIGV4cG9ydHMudXRjVGh1cnNkYXkgPSB1dGNUaHVyc2RheTtcbiAgZXhwb3J0cy51dGNGcmlkYXkgPSB1dGNGcmlkYXk7XG4gIGV4cG9ydHMudXRjU2F0dXJkYXkgPSB1dGNTYXR1cmRheTtcbiAgZXhwb3J0cy51dGNXZWVrID0gdXRjU3VuZGF5O1xuICBleHBvcnRzLnV0Y01vbnRoID0gdXRjTW9udGg7XG4gIGV4cG9ydHMudXRjWWVhciA9IHV0Y1llYXI7XG4gIGV4cG9ydHMuaW50ZXJ2YWwgPSBuZXdJbnRlcnZhbDtcblxufSkpOyIsInZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpLFxuICAgIHRpbWUgPSByZXF1aXJlKCcuLi90aW1lJyksXG4gICAgRVBTSUxPTiA9IDFlLTE1O1xuXG5mdW5jdGlvbiBiaW5zKG9wdCkge1xuICBpZiAoIW9wdCkgeyB0aHJvdyBFcnJvcihcIk1pc3NpbmcgYmlubmluZyBvcHRpb25zLlwiKTsgfVxuXG4gIC8vIGRldGVybWluZSByYW5nZVxuICB2YXIgbWF4YiA9IG9wdC5tYXhiaW5zIHx8IDE1LFxuICAgICAgYmFzZSA9IG9wdC5iYXNlIHx8IDEwLFxuICAgICAgbG9nYiA9IE1hdGgubG9nKGJhc2UpLFxuICAgICAgZGl2ID0gb3B0LmRpdiB8fCBbNSwgMl0sXG4gICAgICBtaW4gPSBvcHQubWluLFxuICAgICAgbWF4ID0gb3B0Lm1heCxcbiAgICAgIHNwYW4gPSBtYXggLSBtaW4sXG4gICAgICBzdGVwLCBsZXZlbCwgbWluc3RlcCwgcHJlY2lzaW9uLCB2LCBpLCBlcHM7XG5cbiAgaWYgKG9wdC5zdGVwKSB7XG4gICAgLy8gaWYgc3RlcCBzaXplIGlzIGV4cGxpY2l0bHkgZ2l2ZW4sIHVzZSB0aGF0XG4gICAgc3RlcCA9IG9wdC5zdGVwO1xuICB9IGVsc2UgaWYgKG9wdC5zdGVwcykge1xuICAgIC8vIGlmIHByb3ZpZGVkLCBsaW1pdCBjaG9pY2UgdG8gYWNjZXB0YWJsZSBzdGVwIHNpemVzXG4gICAgc3RlcCA9IG9wdC5zdGVwc1tNYXRoLm1pbihcbiAgICAgIG9wdC5zdGVwcy5sZW5ndGggLSAxLFxuICAgICAgYmlzZWN0KG9wdC5zdGVwcywgc3Bhbi9tYXhiLCAwLCBvcHQuc3RlcHMubGVuZ3RoKVxuICAgICldO1xuICB9IGVsc2Uge1xuICAgIC8vIGVsc2UgdXNlIHNwYW4gdG8gZGV0ZXJtaW5lIHN0ZXAgc2l6ZVxuICAgIGxldmVsID0gTWF0aC5jZWlsKE1hdGgubG9nKG1heGIpIC8gbG9nYik7XG4gICAgbWluc3RlcCA9IG9wdC5taW5zdGVwIHx8IDA7XG4gICAgc3RlcCA9IE1hdGgubWF4KFxuICAgICAgbWluc3RlcCxcbiAgICAgIE1hdGgucG93KGJhc2UsIE1hdGgucm91bmQoTWF0aC5sb2coc3BhbikgLyBsb2diKSAtIGxldmVsKVxuICAgICk7XG5cbiAgICAvLyBpbmNyZWFzZSBzdGVwIHNpemUgaWYgdG9vIG1hbnkgYmluc1xuICAgIHdoaWxlIChNYXRoLmNlaWwoc3Bhbi9zdGVwKSA+IG1heGIpIHsgc3RlcCAqPSBiYXNlOyB9XG5cbiAgICAvLyBkZWNyZWFzZSBzdGVwIHNpemUgaWYgYWxsb3dlZFxuICAgIGZvciAoaT0wOyBpPGRpdi5sZW5ndGg7ICsraSkge1xuICAgICAgdiA9IHN0ZXAgLyBkaXZbaV07XG4gICAgICBpZiAodiA+PSBtaW5zdGVwICYmIHNwYW4gLyB2IDw9IG1heGIpIHN0ZXAgPSB2O1xuICAgIH1cbiAgfVxuXG4gIC8vIHVwZGF0ZSBwcmVjaXNpb24sIG1pbiBhbmQgbWF4XG4gIHYgPSBNYXRoLmxvZyhzdGVwKTtcbiAgcHJlY2lzaW9uID0gdiA+PSAwID8gMCA6IH5+KC12IC8gbG9nYikgKyAxO1xuICBlcHMgPSBNYXRoLnBvdyhiYXNlLCAtcHJlY2lzaW9uIC0gMSk7XG4gIG1pbiA9IE1hdGgubWluKG1pbiwgTWF0aC5mbG9vcihtaW4gLyBzdGVwICsgZXBzKSAqIHN0ZXApO1xuICBtYXggPSBNYXRoLmNlaWwobWF4IC8gc3RlcCkgKiBzdGVwO1xuXG4gIHJldHVybiB7XG4gICAgc3RhcnQ6IG1pbixcbiAgICBzdG9wOiAgbWF4LFxuICAgIHN0ZXA6ICBzdGVwLFxuICAgIHVuaXQ6ICB7cHJlY2lzaW9uOiBwcmVjaXNpb259LFxuICAgIHZhbHVlOiB2YWx1ZSxcbiAgICBpbmRleDogaW5kZXhcbiAgfTtcbn1cblxuZnVuY3Rpb24gYmlzZWN0KGEsIHgsIGxvLCBoaSkge1xuICB3aGlsZSAobG8gPCBoaSkge1xuICAgIHZhciBtaWQgPSBsbyArIGhpID4+PiAxO1xuICAgIGlmICh1dGlsLmNtcChhW21pZF0sIHgpIDwgMCkgeyBsbyA9IG1pZCArIDE7IH1cbiAgICBlbHNlIHsgaGkgPSBtaWQ7IH1cbiAgfVxuICByZXR1cm4gbG87XG59XG5cbmZ1bmN0aW9uIHZhbHVlKHYpIHtcbiAgcmV0dXJuIHRoaXMuc3RlcCAqIE1hdGguZmxvb3IodiAvIHRoaXMuc3RlcCArIEVQU0lMT04pO1xufVxuXG5mdW5jdGlvbiBpbmRleCh2KSB7XG4gIHJldHVybiBNYXRoLmZsb29yKCh2IC0gdGhpcy5zdGFydCkgLyB0aGlzLnN0ZXAgKyBFUFNJTE9OKTtcbn1cblxuZnVuY3Rpb24gZGF0ZV92YWx1ZSh2KSB7XG4gIHJldHVybiB0aGlzLnVuaXQuZGF0ZSh2YWx1ZS5jYWxsKHRoaXMsIHYpKTtcbn1cblxuZnVuY3Rpb24gZGF0ZV9pbmRleCh2KSB7XG4gIHJldHVybiBpbmRleC5jYWxsKHRoaXMsIHRoaXMudW5pdC51bml0KHYpKTtcbn1cblxuYmlucy5kYXRlID0gZnVuY3Rpb24ob3B0KSB7XG4gIGlmICghb3B0KSB7IHRocm93IEVycm9yKFwiTWlzc2luZyBkYXRlIGJpbm5pbmcgb3B0aW9ucy5cIik7IH1cblxuICAvLyBmaW5kIHRpbWUgc3RlcCwgdGhlbiBiaW5cbiAgdmFyIHVuaXRzID0gb3B0LnV0YyA/IHRpbWUudXRjIDogdGltZSxcbiAgICAgIGRtaW4gPSBvcHQubWluLFxuICAgICAgZG1heCA9IG9wdC5tYXgsXG4gICAgICBtYXhiID0gb3B0Lm1heGJpbnMgfHwgMjAsXG4gICAgICBtaW5iID0gb3B0Lm1pbmJpbnMgfHwgNCxcbiAgICAgIHNwYW4gPSAoK2RtYXgpIC0gKCtkbWluKSxcbiAgICAgIHVuaXQgPSBvcHQudW5pdCA/IHVuaXRzW29wdC51bml0XSA6IHVuaXRzLmZpbmQoc3BhbiwgbWluYiwgbWF4YiksXG4gICAgICBzcGVjID0gYmlucyh7XG4gICAgICAgIG1pbjogICAgIHVuaXQubWluICE9IG51bGwgPyB1bml0Lm1pbiA6IHVuaXQudW5pdChkbWluKSxcbiAgICAgICAgbWF4OiAgICAgdW5pdC5tYXggIT0gbnVsbCA/IHVuaXQubWF4IDogdW5pdC51bml0KGRtYXgpLFxuICAgICAgICBtYXhiaW5zOiBtYXhiLFxuICAgICAgICBtaW5zdGVwOiB1bml0Lm1pbnN0ZXAsXG4gICAgICAgIHN0ZXBzOiAgIHVuaXQuc3RlcFxuICAgICAgfSk7XG5cbiAgc3BlYy51bml0ID0gdW5pdDtcbiAgc3BlYy5pbmRleCA9IGRhdGVfaW5kZXg7XG4gIGlmICghb3B0LnJhdykgc3BlYy52YWx1ZSA9IGRhdGVfdmFsdWU7XG4gIHJldHVybiBzcGVjO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBiaW5zO1xuIiwidmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKSxcbiAgICBnZW4gPSBtb2R1bGUuZXhwb3J0cztcblxuZ2VuLnJlcGVhdCA9IGZ1bmN0aW9uKHZhbCwgbikge1xuICB2YXIgYSA9IEFycmF5KG4pLCBpO1xuICBmb3IgKGk9MDsgaTxuOyArK2kpIGFbaV0gPSB2YWw7XG4gIHJldHVybiBhO1xufTtcblxuZ2VuLnplcm9zID0gZnVuY3Rpb24obikge1xuICByZXR1cm4gZ2VuLnJlcGVhdCgwLCBuKTtcbn07XG5cbmdlbi5yYW5nZSA9IGZ1bmN0aW9uKHN0YXJ0LCBzdG9wLCBzdGVwKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMykge1xuICAgIHN0ZXAgPSAxO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgICAgc3RvcCA9IHN0YXJ0O1xuICAgICAgc3RhcnQgPSAwO1xuICAgIH1cbiAgfVxuICBpZiAoKHN0b3AgLSBzdGFydCkgLyBzdGVwID09IEluZmluaXR5KSB0aHJvdyBuZXcgRXJyb3IoJ0luZmluaXRlIHJhbmdlJyk7XG4gIHZhciByYW5nZSA9IFtdLCBpID0gLTEsIGo7XG4gIGlmIChzdGVwIDwgMCkgd2hpbGUgKChqID0gc3RhcnQgKyBzdGVwICogKytpKSA+IHN0b3ApIHJhbmdlLnB1c2goaik7XG4gIGVsc2Ugd2hpbGUgKChqID0gc3RhcnQgKyBzdGVwICogKytpKSA8IHN0b3ApIHJhbmdlLnB1c2goaik7XG4gIHJldHVybiByYW5nZTtcbn07XG5cbmdlbi5yYW5kb20gPSB7fTtcblxuZ2VuLnJhbmRvbS51bmlmb3JtID0gZnVuY3Rpb24obWluLCBtYXgpIHtcbiAgaWYgKG1heCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgbWF4ID0gbWluID09PSB1bmRlZmluZWQgPyAxIDogbWluO1xuICAgIG1pbiA9IDA7XG4gIH1cbiAgdmFyIGQgPSBtYXggLSBtaW47XG4gIHZhciBmID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG1pbiArIGQgKiBNYXRoLnJhbmRvbSgpO1xuICB9O1xuICBmLnNhbXBsZXMgPSBmdW5jdGlvbihuKSB7XG4gICAgcmV0dXJuIGdlbi56ZXJvcyhuKS5tYXAoZik7XG4gIH07XG4gIGYucGRmID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiAoeCA+PSBtaW4gJiYgeCA8PSBtYXgpID8gMS9kIDogMDtcbiAgfTtcbiAgZi5jZGYgPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHggPCBtaW4gPyAwIDogeCA+IG1heCA/IDEgOiAoeCAtIG1pbikgLyBkO1xuICB9O1xuICBmLmljZGYgPSBmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuIChwID49IDAgJiYgcCA8PSAxKSA/IG1pbiArIHAqZCA6IE5hTjtcbiAgfTtcbiAgcmV0dXJuIGY7XG59O1xuXG5nZW4ucmFuZG9tLmludGVnZXIgPSBmdW5jdGlvbihhLCBiKSB7XG4gIGlmIChiID09PSB1bmRlZmluZWQpIHtcbiAgICBiID0gYTtcbiAgICBhID0gMDtcbiAgfVxuICB2YXIgZCA9IGIgLSBhO1xuICB2YXIgZiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBhICsgTWF0aC5mbG9vcihkICogTWF0aC5yYW5kb20oKSk7XG4gIH07XG4gIGYuc2FtcGxlcyA9IGZ1bmN0aW9uKG4pIHtcbiAgICByZXR1cm4gZ2VuLnplcm9zKG4pLm1hcChmKTtcbiAgfTtcbiAgZi5wZGYgPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuICh4ID09PSBNYXRoLmZsb29yKHgpICYmIHggPj0gYSAmJiB4IDwgYikgPyAxL2QgOiAwO1xuICB9O1xuICBmLmNkZiA9IGZ1bmN0aW9uKHgpIHtcbiAgICB2YXIgdiA9IE1hdGguZmxvb3IoeCk7XG4gICAgcmV0dXJuIHYgPCBhID8gMCA6IHYgPj0gYiA/IDEgOiAodiAtIGEgKyAxKSAvIGQ7XG4gIH07XG4gIGYuaWNkZiA9IGZ1bmN0aW9uKHApIHtcbiAgICByZXR1cm4gKHAgPj0gMCAmJiBwIDw9IDEpID8gYSAtIDEgKyBNYXRoLmZsb29yKHAqZCkgOiBOYU47XG4gIH07XG4gIHJldHVybiBmO1xufTtcblxuZ2VuLnJhbmRvbS5ub3JtYWwgPSBmdW5jdGlvbihtZWFuLCBzdGRldikge1xuICBtZWFuID0gbWVhbiB8fCAwO1xuICBzdGRldiA9IHN0ZGV2IHx8IDE7XG4gIHZhciBuZXh0O1xuICB2YXIgZiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB4ID0gMCwgeSA9IDAsIHJkcywgYztcbiAgICBpZiAobmV4dCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB4ID0gbmV4dDtcbiAgICAgIG5leHQgPSB1bmRlZmluZWQ7XG4gICAgICByZXR1cm4geDtcbiAgICB9XG4gICAgZG8ge1xuICAgICAgeCA9IE1hdGgucmFuZG9tKCkqMi0xO1xuICAgICAgeSA9IE1hdGgucmFuZG9tKCkqMi0xO1xuICAgICAgcmRzID0geCp4ICsgeSp5O1xuICAgIH0gd2hpbGUgKHJkcyA9PT0gMCB8fCByZHMgPiAxKTtcbiAgICBjID0gTWF0aC5zcXJ0KC0yKk1hdGgubG9nKHJkcykvcmRzKTsgLy8gQm94LU11bGxlciB0cmFuc2Zvcm1cbiAgICBuZXh0ID0gbWVhbiArIHkqYypzdGRldjtcbiAgICByZXR1cm4gbWVhbiArIHgqYypzdGRldjtcbiAgfTtcbiAgZi5zYW1wbGVzID0gZnVuY3Rpb24obikge1xuICAgIHJldHVybiBnZW4uemVyb3MobikubWFwKGYpO1xuICB9O1xuICBmLnBkZiA9IGZ1bmN0aW9uKHgpIHtcbiAgICB2YXIgZXhwID0gTWF0aC5leHAoTWF0aC5wb3coeC1tZWFuLCAyKSAvICgtMiAqIE1hdGgucG93KHN0ZGV2LCAyKSkpO1xuICAgIHJldHVybiAoMSAvIChzdGRldiAqIE1hdGguc3FydCgyKk1hdGguUEkpKSkgKiBleHA7XG4gIH07XG4gIGYuY2RmID0gZnVuY3Rpb24oeCkge1xuICAgIC8vIEFwcHJveGltYXRpb24gZnJvbSBXZXN0ICgyMDA5KVxuICAgIC8vIEJldHRlciBBcHByb3hpbWF0aW9ucyB0byBDdW11bGF0aXZlIE5vcm1hbCBGdW5jdGlvbnNcbiAgICB2YXIgY2QsXG4gICAgICAgIHogPSAoeCAtIG1lYW4pIC8gc3RkZXYsXG4gICAgICAgIFogPSBNYXRoLmFicyh6KTtcbiAgICBpZiAoWiA+IDM3KSB7XG4gICAgICBjZCA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBzdW0sIGV4cCA9IE1hdGguZXhwKC1aKlovMik7XG4gICAgICBpZiAoWiA8IDcuMDcxMDY3ODExODY1NDcpIHtcbiAgICAgICAgc3VtID0gMy41MjYyNDk2NTk5ODkxMWUtMDIgKiBaICsgMC43MDAzODMwNjQ0NDM2ODg7XG4gICAgICAgIHN1bSA9IHN1bSAqIFogKyA2LjM3Mzk2MjIwMzUzMTY1O1xuICAgICAgICBzdW0gPSBzdW0gKiBaICsgMzMuOTEyODY2MDc4MzgzO1xuICAgICAgICBzdW0gPSBzdW0gKiBaICsgMTEyLjA3OTI5MTQ5Nzg3MTtcbiAgICAgICAgc3VtID0gc3VtICogWiArIDIyMS4yMTM1OTYxNjk5MzE7XG4gICAgICAgIHN1bSA9IHN1bSAqIFogKyAyMjAuMjA2ODY3OTEyMzc2O1xuICAgICAgICBjZCA9IGV4cCAqIHN1bTtcbiAgICAgICAgc3VtID0gOC44Mzg4MzQ3NjQ4MzE4NGUtMDIgKiBaICsgMS43NTU2NjcxNjMxODI2NDtcbiAgICAgICAgc3VtID0gc3VtICogWiArIDE2LjA2NDE3NzU3OTIwNztcbiAgICAgICAgc3VtID0gc3VtICogWiArIDg2Ljc4MDczMjIwMjk0NjE7XG4gICAgICAgIHN1bSA9IHN1bSAqIFogKyAyOTYuNTY0MjQ4Nzc5Njc0O1xuICAgICAgICBzdW0gPSBzdW0gKiBaICsgNjM3LjMzMzYzMzM3ODgzMTtcbiAgICAgICAgc3VtID0gc3VtICogWiArIDc5My44MjY1MTI1MTk5NDg7XG4gICAgICAgIHN1bSA9IHN1bSAqIFogKyA0NDAuNDEzNzM1ODI0NzUyO1xuICAgICAgICBjZCA9IGNkIC8gc3VtO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3VtID0gWiArIDAuNjU7XG4gICAgICAgIHN1bSA9IFogKyA0IC8gc3VtO1xuICAgICAgICBzdW0gPSBaICsgMyAvIHN1bTtcbiAgICAgICAgc3VtID0gWiArIDIgLyBzdW07XG4gICAgICAgIHN1bSA9IFogKyAxIC8gc3VtO1xuICAgICAgICBjZCA9IGV4cCAvIHN1bSAvIDIuNTA2NjI4Mjc0NjMxO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geiA+IDAgPyAxIC0gY2QgOiBjZDtcbiAgfTtcbiAgZi5pY2RmID0gZnVuY3Rpb24ocCkge1xuICAgIC8vIEFwcHJveGltYXRpb24gb2YgUHJvYml0IGZ1bmN0aW9uIHVzaW5nIGludmVyc2UgZXJyb3IgZnVuY3Rpb24uXG4gICAgaWYgKHAgPD0gMCB8fCBwID49IDEpIHJldHVybiBOYU47XG4gICAgdmFyIHggPSAyKnAgLSAxLFxuICAgICAgICB2ID0gKDggKiAoTWF0aC5QSSAtIDMpKSAvICgzICogTWF0aC5QSSAqICg0LU1hdGguUEkpKSxcbiAgICAgICAgYSA9ICgyIC8gKE1hdGguUEkqdikpICsgKE1hdGgubG9nKDEgLSBNYXRoLnBvdyh4LDIpKSAvIDIpLFxuICAgICAgICBiID0gTWF0aC5sb2coMSAtICh4KngpKSAvIHYsXG4gICAgICAgIHMgPSAoeCA+IDAgPyAxIDogLTEpICogTWF0aC5zcXJ0KE1hdGguc3FydCgoYSphKSAtIGIpIC0gYSk7XG4gICAgcmV0dXJuIG1lYW4gKyBzdGRldiAqIE1hdGguU1FSVDIgKiBzO1xuICB9O1xuICByZXR1cm4gZjtcbn07XG5cbmdlbi5yYW5kb20uYm9vdHN0cmFwID0gZnVuY3Rpb24oZG9tYWluLCBzbW9vdGgpIHtcbiAgLy8gR2VuZXJhdGVzIGEgYm9vdHN0cmFwIHNhbXBsZSBmcm9tIGEgc2V0IG9mIG9ic2VydmF0aW9ucy5cbiAgLy8gU21vb3RoIGJvb3RzdHJhcHBpbmcgYWRkcyByYW5kb20gemVyby1jZW50ZXJlZCBub2lzZSB0byB0aGUgc2FtcGxlcy5cbiAgdmFyIHZhbCA9IGRvbWFpbi5maWx0ZXIodXRpbC5pc1ZhbGlkKSxcbiAgICAgIGxlbiA9IHZhbC5sZW5ndGgsXG4gICAgICBlcnIgPSBzbW9vdGggPyBnZW4ucmFuZG9tLm5vcm1hbCgwLCBzbW9vdGgpIDogbnVsbDtcbiAgdmFyIGYgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdmFsW35+KE1hdGgucmFuZG9tKCkqbGVuKV0gKyAoZXJyID8gZXJyKCkgOiAwKTtcbiAgfTtcbiAgZi5zYW1wbGVzID0gZnVuY3Rpb24obikge1xuICAgIHJldHVybiBnZW4uemVyb3MobikubWFwKGYpO1xuICB9O1xuICByZXR1cm4gZjtcbn07IiwidmFyIGQzX3RpbWUgPSByZXF1aXJlKCdkMy10aW1lJyk7XG5cbnZhciB0ZW1wRGF0ZSA9IG5ldyBEYXRlKCksXG4gICAgYmFzZURhdGUgPSBuZXcgRGF0ZSgwLCAwLCAxKS5zZXRGdWxsWWVhcigwKSwgLy8gSmFuIDEsIDAgQURcbiAgICB1dGNCYXNlRGF0ZSA9IG5ldyBEYXRlKERhdGUuVVRDKDAsIDAsIDEpKS5zZXRVVENGdWxsWWVhcigwKTtcblxuZnVuY3Rpb24gZGF0ZShkKSB7XG4gIHJldHVybiAodGVtcERhdGUuc2V0VGltZSgrZCksIHRlbXBEYXRlKTtcbn1cblxuLy8gY3JlYXRlIGEgdGltZSB1bml0IGVudHJ5XG5mdW5jdGlvbiBlbnRyeSh0eXBlLCBkYXRlLCB1bml0LCBzdGVwLCBtaW4sIG1heCkge1xuICB2YXIgZSA9IHtcbiAgICB0eXBlOiB0eXBlLFxuICAgIGRhdGU6IGRhdGUsXG4gICAgdW5pdDogdW5pdFxuICB9O1xuICBpZiAoc3RlcCkge1xuICAgIGUuc3RlcCA9IHN0ZXA7XG4gIH0gZWxzZSB7XG4gICAgZS5taW5zdGVwID0gMTtcbiAgfVxuICBpZiAobWluICE9IG51bGwpIGUubWluID0gbWluO1xuICBpZiAobWF4ICE9IG51bGwpIGUubWF4ID0gbWF4O1xuICByZXR1cm4gZTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlKHR5cGUsIHVuaXQsIGJhc2UsIHN0ZXAsIG1pbiwgbWF4KSB7XG4gIHJldHVybiBlbnRyeSh0eXBlLFxuICAgIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIHVuaXQub2Zmc2V0KGJhc2UsIGQpOyB9LFxuICAgIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIHVuaXQuY291bnQoYmFzZSwgZCk7IH0sXG4gICAgc3RlcCwgbWluLCBtYXgpO1xufVxuXG52YXIgbG9jYWxlID0gW1xuICBjcmVhdGUoJ3NlY29uZCcsIGQzX3RpbWUuc2Vjb25kLCBiYXNlRGF0ZSksXG4gIGNyZWF0ZSgnbWludXRlJywgZDNfdGltZS5taW51dGUsIGJhc2VEYXRlKSxcbiAgY3JlYXRlKCdob3VyJywgICBkM190aW1lLmhvdXIsICAgYmFzZURhdGUpLFxuICBjcmVhdGUoJ2RheScsICAgIGQzX3RpbWUuZGF5LCAgICBiYXNlRGF0ZSwgWzEsIDddKSxcbiAgY3JlYXRlKCdtb250aCcsICBkM190aW1lLm1vbnRoLCAgYmFzZURhdGUsIFsxLCAzLCA2XSksXG4gIGNyZWF0ZSgneWVhcicsICAgZDNfdGltZS55ZWFyLCAgIGJhc2VEYXRlKSxcblxuICAvLyBwZXJpb2RpYyB1bml0c1xuICBlbnRyeSgnc2Vjb25kcycsXG4gICAgZnVuY3Rpb24oZCkgeyByZXR1cm4gbmV3IERhdGUoMTk3MCwgMCwgMSwgMCwgMCwgZCk7IH0sXG4gICAgZnVuY3Rpb24oZCkgeyByZXR1cm4gZGF0ZShkKS5nZXRTZWNvbmRzKCk7IH0sXG4gICAgbnVsbCwgMCwgNTlcbiAgKSxcbiAgZW50cnkoJ21pbnV0ZXMnLFxuICAgIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIG5ldyBEYXRlKDE5NzAsIDAsIDEsIDAsIGQpOyB9LFxuICAgIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRhdGUoZCkuZ2V0TWludXRlcygpOyB9LFxuICAgIG51bGwsIDAsIDU5XG4gICksXG4gIGVudHJ5KCdob3VycycsXG4gICAgZnVuY3Rpb24oZCkgeyByZXR1cm4gbmV3IERhdGUoMTk3MCwgMCwgMSwgZCk7IH0sXG4gICAgZnVuY3Rpb24oZCkgeyByZXR1cm4gZGF0ZShkKS5nZXRIb3VycygpOyB9LFxuICAgIG51bGwsIDAsIDIzXG4gICksXG4gIGVudHJ5KCd3ZWVrZGF5cycsXG4gICAgZnVuY3Rpb24oZCkgeyByZXR1cm4gbmV3IERhdGUoMTk3MCwgMCwgNCtkKTsgfSxcbiAgICBmdW5jdGlvbihkKSB7IHJldHVybiBkYXRlKGQpLmdldERheSgpOyB9LFxuICAgIFsxXSwgMCwgNlxuICApLFxuICBlbnRyeSgnZGF0ZXMnLFxuICAgIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIG5ldyBEYXRlKDE5NzAsIDAsIGQpOyB9LFxuICAgIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRhdGUoZCkuZ2V0RGF0ZSgpOyB9LFxuICAgIFsxXSwgMSwgMzFcbiAgKSxcbiAgZW50cnkoJ21vbnRocycsXG4gICAgZnVuY3Rpb24oZCkgeyByZXR1cm4gbmV3IERhdGUoMTk3MCwgZCAlIDEyLCAxKTsgfSxcbiAgICBmdW5jdGlvbihkKSB7IHJldHVybiBkYXRlKGQpLmdldE1vbnRoKCk7IH0sXG4gICAgWzFdLCAwLCAxMVxuICApXG5dO1xuXG52YXIgdXRjID0gW1xuICBjcmVhdGUoJ3NlY29uZCcsIGQzX3RpbWUudXRjU2Vjb25kLCB1dGNCYXNlRGF0ZSksXG4gIGNyZWF0ZSgnbWludXRlJywgZDNfdGltZS51dGNNaW51dGUsIHV0Y0Jhc2VEYXRlKSxcbiAgY3JlYXRlKCdob3VyJywgICBkM190aW1lLnV0Y0hvdXIsICAgdXRjQmFzZURhdGUpLFxuICBjcmVhdGUoJ2RheScsICAgIGQzX3RpbWUudXRjRGF5LCAgICB1dGNCYXNlRGF0ZSwgWzEsIDddKSxcbiAgY3JlYXRlKCdtb250aCcsICBkM190aW1lLnV0Y01vbnRoLCAgdXRjQmFzZURhdGUsIFsxLCAzLCA2XSksXG4gIGNyZWF0ZSgneWVhcicsICAgZDNfdGltZS51dGNZZWFyLCAgIHV0Y0Jhc2VEYXRlKSxcblxuICAvLyBwZXJpb2RpYyB1bml0c1xuICBlbnRyeSgnc2Vjb25kcycsXG4gICAgZnVuY3Rpb24oZCkgeyByZXR1cm4gbmV3IERhdGUoRGF0ZS5VVEMoMTk3MCwgMCwgMSwgMCwgMCwgZCkpOyB9LFxuICAgIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRhdGUoZCkuZ2V0VVRDU2Vjb25kcygpOyB9LFxuICAgIG51bGwsIDAsIDU5XG4gICksXG4gIGVudHJ5KCdtaW51dGVzJyxcbiAgICBmdW5jdGlvbihkKSB7IHJldHVybiBuZXcgRGF0ZShEYXRlLlVUQygxOTcwLCAwLCAxLCAwLCBkKSk7IH0sXG4gICAgZnVuY3Rpb24oZCkgeyByZXR1cm4gZGF0ZShkKS5nZXRVVENNaW51dGVzKCk7IH0sXG4gICAgbnVsbCwgMCwgNTlcbiAgKSxcbiAgZW50cnkoJ2hvdXJzJyxcbiAgICBmdW5jdGlvbihkKSB7IHJldHVybiBuZXcgRGF0ZShEYXRlLlVUQygxOTcwLCAwLCAxLCBkKSk7IH0sXG4gICAgZnVuY3Rpb24oZCkgeyByZXR1cm4gZGF0ZShkKS5nZXRVVENIb3VycygpOyB9LFxuICAgIG51bGwsIDAsIDIzXG4gICksXG4gIGVudHJ5KCd3ZWVrZGF5cycsXG4gICAgZnVuY3Rpb24oZCkgeyByZXR1cm4gbmV3IERhdGUoRGF0ZS5VVEMoMTk3MCwgMCwgNCtkKSk7IH0sXG4gICAgZnVuY3Rpb24oZCkgeyByZXR1cm4gZGF0ZShkKS5nZXRVVENEYXkoKTsgfSxcbiAgICBbMV0sIDAsIDZcbiAgKSxcbiAgZW50cnkoJ2RhdGVzJyxcbiAgICBmdW5jdGlvbihkKSB7IHJldHVybiBuZXcgRGF0ZShEYXRlLlVUQygxOTcwLCAwLCBkKSk7IH0sXG4gICAgZnVuY3Rpb24oZCkgeyByZXR1cm4gZGF0ZShkKS5nZXRVVENEYXRlKCk7IH0sXG4gICAgWzFdLCAxLCAzMVxuICApLFxuICBlbnRyeSgnbW9udGhzJyxcbiAgICBmdW5jdGlvbihkKSB7IHJldHVybiBuZXcgRGF0ZShEYXRlLlVUQygxOTcwLCBkICUgMTIsIDEpKTsgfSxcbiAgICBmdW5jdGlvbihkKSB7IHJldHVybiBkYXRlKGQpLmdldFVUQ01vbnRoKCk7IH0sXG4gICAgWzFdLCAwLCAxMVxuICApXG5dO1xuXG52YXIgU1RFUFMgPSBbXG4gIFszMTUzNmU2LCA1XSwgIC8vIDEteWVhclxuICBbNzc3NmU2LCA0XSwgICAvLyAzLW1vbnRoXG4gIFsyNTkyZTYsIDRdLCAgIC8vIDEtbW9udGhcbiAgWzEyMDk2ZTUsIDNdLCAgLy8gMi13ZWVrXG4gIFs2MDQ4ZTUsIDNdLCAgIC8vIDEtd2Vla1xuICBbMTcyOGU1LCAzXSwgICAvLyAyLWRheVxuICBbODY0ZTUsIDNdLCAgICAvLyAxLWRheVxuICBbNDMyZTUsIDJdLCAgICAvLyAxMi1ob3VyXG4gIFsyMTZlNSwgMl0sICAgIC8vIDYtaG91clxuICBbMTA4ZTUsIDJdLCAgICAvLyAzLWhvdXJcbiAgWzM2ZTUsIDJdLCAgICAgLy8gMS1ob3VyXG4gIFsxOGU1LCAxXSwgICAgIC8vIDMwLW1pbnV0ZVxuICBbOWU1LCAxXSwgICAgICAvLyAxNS1taW51dGVcbiAgWzNlNSwgMV0sICAgICAgLy8gNS1taW51dGVcbiAgWzZlNCwgMV0sICAgICAgLy8gMS1taW51dGVcbiAgWzNlNCwgMF0sICAgICAgLy8gMzAtc2Vjb25kXG4gIFsxNWUzLCAwXSwgICAgIC8vIDE1LXNlY29uZFxuICBbNWUzLCAwXSwgICAgICAvLyA1LXNlY29uZFxuICBbMWUzLCAwXSAgICAgICAvLyAxLXNlY29uZFxuXTtcblxuZnVuY3Rpb24gZmluZCh1bml0cywgc3BhbiwgbWluYiwgbWF4Yikge1xuICB2YXIgc3RlcCA9IFNURVBTWzBdLCBpLCBuLCBiaW5zO1xuXG4gIGZvciAoaT0xLCBuPVNURVBTLmxlbmd0aDsgaTxuOyArK2kpIHtcbiAgICBzdGVwID0gU1RFUFNbaV07XG4gICAgaWYgKHNwYW4gPiBzdGVwWzBdKSB7XG4gICAgICBiaW5zID0gc3BhbiAvIHN0ZXBbMF07XG4gICAgICBpZiAoYmlucyA+IG1heGIpIHtcbiAgICAgICAgcmV0dXJuIHVuaXRzW1NURVBTW2ktMV1bMV1dO1xuICAgICAgfVxuICAgICAgaWYgKGJpbnMgPj0gbWluYikge1xuICAgICAgICByZXR1cm4gdW5pdHNbc3RlcFsxXV07XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiB1bml0c1tTVEVQU1tuLTFdWzFdXTtcbn1cblxuZnVuY3Rpb24gdG9Vbml0TWFwKHVuaXRzKSB7XG4gIHZhciBtYXAgPSB7fSwgaSwgbjtcbiAgZm9yIChpPTAsIG49dW5pdHMubGVuZ3RoOyBpPG47ICsraSkge1xuICAgIG1hcFt1bml0c1tpXS50eXBlXSA9IHVuaXRzW2ldO1xuICB9XG4gIG1hcC5maW5kID0gZnVuY3Rpb24oc3BhbiwgbWluYiwgbWF4Yikge1xuICAgIHJldHVybiBmaW5kKHVuaXRzLCBzcGFuLCBtaW5iLCBtYXhiKTtcbiAgfTtcbiAgcmV0dXJuIG1hcDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0b1VuaXRNYXAobG9jYWxlKTtcbm1vZHVsZS5leHBvcnRzLnV0YyA9IHRvVW5pdE1hcCh1dGMpOyIsInZhciB1ID0gbW9kdWxlLmV4cG9ydHM7XG5cbi8vIHV0aWxpdHkgZnVuY3Rpb25zXG5cbnZhciBGTkFNRSA9ICdfX25hbWVfXyc7XG5cbnUubmFtZWRmdW5jID0gZnVuY3Rpb24obmFtZSwgZikgeyByZXR1cm4gKGZbRk5BTUVdID0gbmFtZSwgZik7IH07XG5cbnUubmFtZSA9IGZ1bmN0aW9uKGYpIHsgcmV0dXJuIGY9PW51bGwgPyBudWxsIDogZltGTkFNRV07IH07XG5cbnUuaWRlbnRpdHkgPSBmdW5jdGlvbih4KSB7IHJldHVybiB4OyB9O1xuXG51LnRydWUgPSB1Lm5hbWVkZnVuYygndHJ1ZScsIGZ1bmN0aW9uKCkgeyByZXR1cm4gdHJ1ZTsgfSk7XG5cbnUuZmFsc2UgPSB1Lm5hbWVkZnVuYygnZmFsc2UnLCBmdW5jdGlvbigpIHsgcmV0dXJuIGZhbHNlOyB9KTtcblxudS5kdXBsaWNhdGUgPSBmdW5jdGlvbihvYmopIHtcbiAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob2JqKSk7XG59O1xuXG51LmVxdWFsID0gZnVuY3Rpb24oYSwgYikge1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYSkgPT09IEpTT04uc3RyaW5naWZ5KGIpO1xufTtcblxudS5leHRlbmQgPSBmdW5jdGlvbihvYmopIHtcbiAgZm9yICh2YXIgeCwgbmFtZSwgaT0xLCBsZW49YXJndW1lbnRzLmxlbmd0aDsgaTxsZW47ICsraSkge1xuICAgIHggPSBhcmd1bWVudHNbaV07XG4gICAgZm9yIChuYW1lIGluIHgpIHsgb2JqW25hbWVdID0geFtuYW1lXTsgfVxuICB9XG4gIHJldHVybiBvYmo7XG59O1xuXG51Lmxlbmd0aCA9IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuIHggIT0gbnVsbCAmJiB4Lmxlbmd0aCAhPSBudWxsID8geC5sZW5ndGggOiBudWxsO1xufTtcblxudS5rZXlzID0gZnVuY3Rpb24oeCkge1xuICB2YXIga2V5cyA9IFtdLCBrO1xuICBmb3IgKGsgaW4geCkga2V5cy5wdXNoKGspO1xuICByZXR1cm4ga2V5cztcbn07XG5cbnUudmFscyA9IGZ1bmN0aW9uKHgpIHtcbiAgdmFyIHZhbHMgPSBbXSwgaztcbiAgZm9yIChrIGluIHgpIHZhbHMucHVzaCh4W2tdKTtcbiAgcmV0dXJuIHZhbHM7XG59O1xuXG51LnRvTWFwID0gZnVuY3Rpb24obGlzdCwgZikge1xuICByZXR1cm4gKGYgPSB1LiQoZikpID9cbiAgICBsaXN0LnJlZHVjZShmdW5jdGlvbihvYmosIHgpIHsgcmV0dXJuIChvYmpbZih4KV0gPSAxLCBvYmopOyB9LCB7fSkgOlxuICAgIGxpc3QucmVkdWNlKGZ1bmN0aW9uKG9iaiwgeCkgeyByZXR1cm4gKG9ialt4XSA9IDEsIG9iaik7IH0sIHt9KTtcbn07XG5cbnUua2V5c3RyID0gZnVuY3Rpb24odmFsdWVzKSB7XG4gIC8vIHVzZSB0byBlbnN1cmUgY29uc2lzdGVudCBrZXkgZ2VuZXJhdGlvbiBhY3Jvc3MgbW9kdWxlc1xuICB2YXIgbiA9IHZhbHVlcy5sZW5ndGg7XG4gIGlmICghbikgcmV0dXJuICcnO1xuICBmb3IgKHZhciBzPVN0cmluZyh2YWx1ZXNbMF0pLCBpPTE7IGk8bjsgKytpKSB7XG4gICAgcyArPSAnfCcgKyBTdHJpbmcodmFsdWVzW2ldKTtcbiAgfVxuICByZXR1cm4gcztcbn07XG5cbi8vIHR5cGUgY2hlY2tpbmcgZnVuY3Rpb25zXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbnUuaXNPYmplY3QgPSBmdW5jdGlvbihvYmopIHtcbiAgcmV0dXJuIG9iaiA9PT0gT2JqZWN0KG9iaik7XG59O1xuXG51LmlzRnVuY3Rpb24gPSBmdW5jdGlvbihvYmopIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbn07XG5cbnUuaXNTdHJpbmcgPSBmdW5jdGlvbihvYmopIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHwgdG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBTdHJpbmddJztcbn07XG5cbnUuaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24ob2JqKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG51LmlzTnVtYmVyID0gZnVuY3Rpb24ob2JqKSB7XG4gIHJldHVybiB0eXBlb2Ygb2JqID09PSAnbnVtYmVyJyB8fCB0b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IE51bWJlcl0nO1xufTtcblxudS5pc0Jvb2xlYW4gPSBmdW5jdGlvbihvYmopIHtcbiAgcmV0dXJuIG9iaiA9PT0gdHJ1ZSB8fCBvYmogPT09IGZhbHNlIHx8IHRvU3RyaW5nLmNhbGwob2JqKSA9PSAnW29iamVjdCBCb29sZWFuXSc7XG59O1xuXG51LmlzRGF0ZSA9IGZ1bmN0aW9uKG9iaikge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBEYXRlXSc7XG59O1xuXG51LmlzVmFsaWQgPSBmdW5jdGlvbihvYmopIHtcbiAgcmV0dXJuIG9iaiAhPSBudWxsICYmIG9iaiA9PT0gb2JqO1xufTtcblxudS5pc0J1ZmZlciA9ICh0eXBlb2YgQnVmZmVyID09PSAnZnVuY3Rpb24nICYmIEJ1ZmZlci5pc0J1ZmZlcikgfHwgdS5mYWxzZTtcblxuLy8gdHlwZSBjb2VyY2lvbiBmdW5jdGlvbnNcblxudS5udW1iZXIgPSBmdW5jdGlvbihzKSB7XG4gIHJldHVybiBzID09IG51bGwgfHwgcyA9PT0gJycgPyBudWxsIDogK3M7XG59O1xuXG51LmJvb2xlYW4gPSBmdW5jdGlvbihzKSB7XG4gIHJldHVybiBzID09IG51bGwgfHwgcyA9PT0gJycgPyBudWxsIDogcz09PSdmYWxzZScgPyBmYWxzZSA6ICEhcztcbn07XG5cbi8vIHBhcnNlIGEgZGF0ZSB3aXRoIG9wdGlvbmFsIGQzLnRpbWUtZm9ybWF0IGZvcm1hdFxudS5kYXRlID0gZnVuY3Rpb24ocywgZm9ybWF0KSB7XG4gIHZhciBkID0gZm9ybWF0ID8gZm9ybWF0IDogRGF0ZTtcbiAgcmV0dXJuIHMgPT0gbnVsbCB8fCBzID09PSAnJyA/IG51bGwgOiBkLnBhcnNlKHMpO1xufTtcblxudS5hcnJheSA9IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuIHggIT0gbnVsbCA/ICh1LmlzQXJyYXkoeCkgPyB4IDogW3hdKSA6IFtdO1xufTtcblxudS5zdHIgPSBmdW5jdGlvbih4KSB7XG4gIHJldHVybiB1LmlzQXJyYXkoeCkgPyAnWycgKyB4Lm1hcCh1LnN0cikgKyAnXSdcbiAgICA6IHUuaXNPYmplY3QoeCkgfHwgdS5pc1N0cmluZyh4KSA/XG4gICAgICAvLyBPdXRwdXQgdmFsaWQgSlNPTiBhbmQgSlMgc291cmNlIHN0cmluZ3MuXG4gICAgICAvLyBTZWUgaHR0cDovL3RpbWVsZXNzcmVwby5jb20vanNvbi1pc250LWEtamF2YXNjcmlwdC1zdWJzZXRcbiAgICAgIEpTT04uc3RyaW5naWZ5KHgpLnJlcGxhY2UoJ1xcdTIwMjgnLCdcXFxcdTIwMjgnKS5yZXBsYWNlKCdcXHUyMDI5JywgJ1xcXFx1MjAyOScpXG4gICAgOiB4O1xufTtcblxuLy8gZGF0YSBhY2Nlc3MgZnVuY3Rpb25zXG5cbnZhciBmaWVsZF9yZSA9IC9cXFsoLio/KVxcXXxbXi5cXFtdKy9nO1xuXG51LmZpZWxkID0gZnVuY3Rpb24oZikge1xuICByZXR1cm4gU3RyaW5nKGYpLm1hdGNoKGZpZWxkX3JlKS5tYXAoZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiBkWzBdICE9PSAnWycgPyBkIDpcbiAgICAgIGRbMV0gIT09IFwiJ1wiICYmIGRbMV0gIT09ICdcIicgPyBkLnNsaWNlKDEsIC0xKSA6XG4gICAgICBkLnNsaWNlKDIsIC0yKS5yZXBsYWNlKC9cXFxcKFtcIiddKS9nLCAnJDEnKTtcbiAgfSk7XG59O1xuXG51LmFjY2Vzc29yID0gZnVuY3Rpb24oZikge1xuICAvKiBqc2hpbnQgZXZpbDogdHJ1ZSAqL1xuICByZXR1cm4gZj09bnVsbCB8fCB1LmlzRnVuY3Rpb24oZikgPyBmIDpcbiAgICB1Lm5hbWVkZnVuYyhmLCBGdW5jdGlvbigneCcsICdyZXR1cm4geFsnICsgdS5maWVsZChmKS5tYXAodS5zdHIpLmpvaW4oJ11bJykgKyAnXTsnKSk7XG59O1xuXG4vLyBzaG9ydC1jdXQgZm9yIGFjY2Vzc29yXG51LiQgPSB1LmFjY2Vzc29yO1xuXG51Lm11dGF0b3IgPSBmdW5jdGlvbihmKSB7XG4gIHZhciBzO1xuICByZXR1cm4gdS5pc1N0cmluZyhmKSAmJiAocz11LmZpZWxkKGYpKS5sZW5ndGggPiAxID9cbiAgICBmdW5jdGlvbih4LCB2KSB7XG4gICAgICBmb3IgKHZhciBpPTA7IGk8cy5sZW5ndGgtMTsgKytpKSB4ID0geFtzW2ldXTtcbiAgICAgIHhbc1tpXV0gPSB2O1xuICAgIH0gOlxuICAgIGZ1bmN0aW9uKHgsIHYpIHsgeFtmXSA9IHY7IH07XG59O1xuXG5cbnUuJGZ1bmMgPSBmdW5jdGlvbihuYW1lLCBvcCkge1xuICByZXR1cm4gZnVuY3Rpb24oZikge1xuICAgIGYgPSB1LiQoZikgfHwgdS5pZGVudGl0eTtcbiAgICB2YXIgbiA9IG5hbWUgKyAodS5uYW1lKGYpID8gJ18nK3UubmFtZShmKSA6ICcnKTtcbiAgICByZXR1cm4gdS5uYW1lZGZ1bmMobiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gb3AoZihkKSk7IH0pO1xuICB9O1xufTtcblxudS4kdmFsaWQgID0gdS4kZnVuYygndmFsaWQnLCB1LmlzVmFsaWQpO1xudS4kbGVuZ3RoID0gdS4kZnVuYygnbGVuZ3RoJywgdS5sZW5ndGgpO1xuXG51LiRpbiA9IGZ1bmN0aW9uKGYsIHZhbHVlcykge1xuICBmID0gdS4kKGYpO1xuICB2YXIgbWFwID0gdS5pc0FycmF5KHZhbHVlcykgPyB1LnRvTWFwKHZhbHVlcykgOiB2YWx1ZXM7XG4gIHJldHVybiBmdW5jdGlvbihkKSB7IHJldHVybiAhIW1hcFtmKGQpXTsgfTtcbn07XG5cbi8vIGNvbXBhcmlzb24gLyBzb3J0aW5nIGZ1bmN0aW9uc1xuXG51LmNvbXBhcmF0b3IgPSBmdW5jdGlvbihzb3J0KSB7XG4gIHZhciBzaWduID0gW107XG4gIGlmIChzb3J0ID09PSB1bmRlZmluZWQpIHNvcnQgPSBbXTtcbiAgc29ydCA9IHUuYXJyYXkoc29ydCkubWFwKGZ1bmN0aW9uKGYpIHtcbiAgICB2YXIgcyA9IDE7XG4gICAgaWYgICAgICAoZlswXSA9PT0gJy0nKSB7IHMgPSAtMTsgZiA9IGYuc2xpY2UoMSk7IH1cbiAgICBlbHNlIGlmIChmWzBdID09PSAnKycpIHsgcyA9ICsxOyBmID0gZi5zbGljZSgxKTsgfVxuICAgIHNpZ24ucHVzaChzKTtcbiAgICByZXR1cm4gdS5hY2Nlc3NvcihmKTtcbiAgfSk7XG4gIHJldHVybiBmdW5jdGlvbihhLGIpIHtcbiAgICB2YXIgaSwgbiwgZiwgeCwgeTtcbiAgICBmb3IgKGk9MCwgbj1zb3J0Lmxlbmd0aDsgaTxuOyArK2kpIHtcbiAgICAgIGYgPSBzb3J0W2ldOyB4ID0gZihhKTsgeSA9IGYoYik7XG4gICAgICBpZiAoeCA8IHkpIHJldHVybiAtMSAqIHNpZ25baV07XG4gICAgICBpZiAoeCA+IHkpIHJldHVybiBzaWduW2ldO1xuICAgIH1cbiAgICByZXR1cm4gMDtcbiAgfTtcbn07XG5cbnUuY21wID0gZnVuY3Rpb24oYSwgYikge1xuICBpZiAoYSA8IGIpIHtcbiAgICByZXR1cm4gLTE7XG4gIH0gZWxzZSBpZiAoYSA+IGIpIHtcbiAgICByZXR1cm4gMTtcbiAgfSBlbHNlIGlmIChhID49IGIpIHtcbiAgICByZXR1cm4gMDtcbiAgfSBlbHNlIGlmIChhID09PSBudWxsKSB7XG4gICAgcmV0dXJuIC0xO1xuICB9IGVsc2UgaWYgKGIgPT09IG51bGwpIHtcbiAgICByZXR1cm4gMTtcbiAgfVxuICByZXR1cm4gTmFOO1xufTtcblxudS5udW1jbXAgPSBmdW5jdGlvbihhLCBiKSB7IHJldHVybiBhIC0gYjsgfTtcblxudS5zdGFibGVzb3J0ID0gZnVuY3Rpb24oYXJyYXksIHNvcnRCeSwga2V5Rm4pIHtcbiAgdmFyIGluZGljZXMgPSBhcnJheS5yZWR1Y2UoZnVuY3Rpb24oaWR4LCB2LCBpKSB7XG4gICAgcmV0dXJuIChpZHhba2V5Rm4odildID0gaSwgaWR4KTtcbiAgfSwge30pO1xuXG4gIGFycmF5LnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciBzYSA9IHNvcnRCeShhKSxcbiAgICAgICAgc2IgPSBzb3J0QnkoYik7XG4gICAgcmV0dXJuIHNhIDwgc2IgPyAtMSA6IHNhID4gc2IgPyAxXG4gICAgICAgICA6IChpbmRpY2VzW2tleUZuKGEpXSAtIGluZGljZXNba2V5Rm4oYildKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGFycmF5O1xufTtcblxuXG4vLyBzdHJpbmcgZnVuY3Rpb25zXG5cbnUucGFkID0gZnVuY3Rpb24ocywgbGVuZ3RoLCBwb3MsIHBhZGNoYXIpIHtcbiAgcGFkY2hhciA9IHBhZGNoYXIgfHwgXCIgXCI7XG4gIHZhciBkID0gbGVuZ3RoIC0gcy5sZW5ndGg7XG4gIGlmIChkIDw9IDApIHJldHVybiBzO1xuICBzd2l0Y2ggKHBvcykge1xuICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgcmV0dXJuIHN0cnJlcChkLCBwYWRjaGFyKSArIHM7XG4gICAgY2FzZSAnbWlkZGxlJzpcbiAgICBjYXNlICdjZW50ZXInOlxuICAgICAgcmV0dXJuIHN0cnJlcChNYXRoLmZsb29yKGQvMiksIHBhZGNoYXIpICtcbiAgICAgICAgIHMgKyBzdHJyZXAoTWF0aC5jZWlsKGQvMiksIHBhZGNoYXIpO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gcyArIHN0cnJlcChkLCBwYWRjaGFyKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gc3RycmVwKG4sIHN0cikge1xuICB2YXIgcyA9IFwiXCIsIGk7XG4gIGZvciAoaT0wOyBpPG47ICsraSkgcyArPSBzdHI7XG4gIHJldHVybiBzO1xufVxuXG51LnRydW5jYXRlID0gZnVuY3Rpb24ocywgbGVuZ3RoLCBwb3MsIHdvcmQsIGVsbGlwc2lzKSB7XG4gIHZhciBsZW4gPSBzLmxlbmd0aDtcbiAgaWYgKGxlbiA8PSBsZW5ndGgpIHJldHVybiBzO1xuICBlbGxpcHNpcyA9IGVsbGlwc2lzICE9PSB1bmRlZmluZWQgPyBTdHJpbmcoZWxsaXBzaXMpIDogJ1xcdTIwMjYnO1xuICB2YXIgbCA9IE1hdGgubWF4KDAsIGxlbmd0aCAtIGVsbGlwc2lzLmxlbmd0aCk7XG5cbiAgc3dpdGNoIChwb3MpIHtcbiAgICBjYXNlICdsZWZ0JzpcbiAgICAgIHJldHVybiBlbGxpcHNpcyArICh3b3JkID8gdHJ1bmNhdGVPbldvcmQocyxsLDEpIDogcy5zbGljZShsZW4tbCkpO1xuICAgIGNhc2UgJ21pZGRsZSc6XG4gICAgY2FzZSAnY2VudGVyJzpcbiAgICAgIHZhciBsMSA9IE1hdGguY2VpbChsLzIpLCBsMiA9IE1hdGguZmxvb3IobC8yKTtcbiAgICAgIHJldHVybiAod29yZCA/IHRydW5jYXRlT25Xb3JkKHMsbDEpIDogcy5zbGljZSgwLGwxKSkgK1xuICAgICAgICBlbGxpcHNpcyArICh3b3JkID8gdHJ1bmNhdGVPbldvcmQocyxsMiwxKSA6IHMuc2xpY2UobGVuLWwyKSk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiAod29yZCA/IHRydW5jYXRlT25Xb3JkKHMsbCkgOiBzLnNsaWNlKDAsbCkpICsgZWxsaXBzaXM7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIHRydW5jYXRlT25Xb3JkKHMsIGxlbiwgcmV2KSB7XG4gIHZhciBjbnQgPSAwLCB0b2sgPSBzLnNwbGl0KHRydW5jYXRlX3dvcmRfcmUpO1xuICBpZiAocmV2KSB7XG4gICAgcyA9ICh0b2sgPSB0b2sucmV2ZXJzZSgpKVxuICAgICAgLmZpbHRlcihmdW5jdGlvbih3KSB7IGNudCArPSB3Lmxlbmd0aDsgcmV0dXJuIGNudCA8PSBsZW47IH0pXG4gICAgICAucmV2ZXJzZSgpO1xuICB9IGVsc2Uge1xuICAgIHMgPSB0b2suZmlsdGVyKGZ1bmN0aW9uKHcpIHsgY250ICs9IHcubGVuZ3RoOyByZXR1cm4gY250IDw9IGxlbjsgfSk7XG4gIH1cbiAgcmV0dXJuIHMubGVuZ3RoID8gcy5qb2luKCcnKS50cmltKCkgOiB0b2tbMF0uc2xpY2UoMCwgbGVuKTtcbn1cblxudmFyIHRydW5jYXRlX3dvcmRfcmUgPSAvKFtcXHUwMDA5XFx1MDAwQVxcdTAwMEJcXHUwMDBDXFx1MDAwRFxcdTAwMjBcXHUwMEEwXFx1MTY4MFxcdTE4MEVcXHUyMDAwXFx1MjAwMVxcdTIwMDJcXHUyMDAzXFx1MjAwNFxcdTIwMDVcXHUyMDA2XFx1MjAwN1xcdTIwMDhcXHUyMDA5XFx1MjAwQVxcdTIwMkZcXHUyMDVGXFx1MjAyOFxcdTIwMjlcXHUzMDAwXFx1RkVGRl0pLztcbiIsInZhciBqc29uID0gdHlwZW9mIEpTT04gIT09ICd1bmRlZmluZWQnID8gSlNPTiA6IHJlcXVpcmUoJ2pzb25pZnknKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob2JqLCBvcHRzKSB7XG4gICAgaWYgKCFvcHRzKSBvcHRzID0ge307XG4gICAgaWYgKHR5cGVvZiBvcHRzID09PSAnZnVuY3Rpb24nKSBvcHRzID0geyBjbXA6IG9wdHMgfTtcbiAgICB2YXIgc3BhY2UgPSBvcHRzLnNwYWNlIHx8ICcnO1xuICAgIGlmICh0eXBlb2Ygc3BhY2UgPT09ICdudW1iZXInKSBzcGFjZSA9IEFycmF5KHNwYWNlKzEpLmpvaW4oJyAnKTtcbiAgICB2YXIgY3ljbGVzID0gKHR5cGVvZiBvcHRzLmN5Y2xlcyA9PT0gJ2Jvb2xlYW4nKSA/IG9wdHMuY3ljbGVzIDogZmFsc2U7XG4gICAgdmFyIHJlcGxhY2VyID0gb3B0cy5yZXBsYWNlciB8fCBmdW5jdGlvbihrZXksIHZhbHVlKSB7IHJldHVybiB2YWx1ZTsgfTtcblxuICAgIHZhciBjbXAgPSBvcHRzLmNtcCAmJiAoZnVuY3Rpb24gKGYpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgICAgICB2YXIgYW9iaiA9IHsga2V5OiBhLCB2YWx1ZTogbm9kZVthXSB9O1xuICAgICAgICAgICAgICAgIHZhciBib2JqID0geyBrZXk6IGIsIHZhbHVlOiBub2RlW2JdIH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIGYoYW9iaiwgYm9iaik7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgIH0pKG9wdHMuY21wKTtcblxuICAgIHZhciBzZWVuID0gW107XG4gICAgcmV0dXJuIChmdW5jdGlvbiBzdHJpbmdpZnkgKHBhcmVudCwga2V5LCBub2RlLCBsZXZlbCkge1xuICAgICAgICB2YXIgaW5kZW50ID0gc3BhY2UgPyAoJ1xcbicgKyBuZXcgQXJyYXkobGV2ZWwgKyAxKS5qb2luKHNwYWNlKSkgOiAnJztcbiAgICAgICAgdmFyIGNvbG9uU2VwYXJhdG9yID0gc3BhY2UgPyAnOiAnIDogJzonO1xuXG4gICAgICAgIGlmIChub2RlICYmIG5vZGUudG9KU09OICYmIHR5cGVvZiBub2RlLnRvSlNPTiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgbm9kZSA9IG5vZGUudG9KU09OKCk7XG4gICAgICAgIH1cblxuICAgICAgICBub2RlID0gcmVwbGFjZXIuY2FsbChwYXJlbnQsIGtleSwgbm9kZSk7XG5cbiAgICAgICAgaWYgKG5vZGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2Ygbm9kZSAhPT0gJ29iamVjdCcgfHwgbm9kZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGpzb24uc3RyaW5naWZ5KG5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0FycmF5KG5vZGUpKSB7XG4gICAgICAgICAgICB2YXIgb3V0ID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHN0cmluZ2lmeShub2RlLCBpLCBub2RlW2ldLCBsZXZlbCsxKSB8fCBqc29uLnN0cmluZ2lmeShudWxsKTtcbiAgICAgICAgICAgICAgICBvdXQucHVzaChpbmRlbnQgKyBzcGFjZSArIGl0ZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuICdbJyArIG91dC5qb2luKCcsJykgKyBpbmRlbnQgKyAnXSc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoc2Vlbi5pbmRleE9mKG5vZGUpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGlmIChjeWNsZXMpIHJldHVybiBqc29uLnN0cmluZ2lmeSgnX19jeWNsZV9fJyk7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ29udmVydGluZyBjaXJjdWxhciBzdHJ1Y3R1cmUgdG8gSlNPTicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBzZWVuLnB1c2gobm9kZSk7XG5cbiAgICAgICAgICAgIHZhciBrZXlzID0gb2JqZWN0S2V5cyhub2RlKS5zb3J0KGNtcCAmJiBjbXAobm9kZSkpO1xuICAgICAgICAgICAgdmFyIG91dCA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gc3RyaW5naWZ5KG5vZGUsIGtleSwgbm9kZVtrZXldLCBsZXZlbCsxKTtcblxuICAgICAgICAgICAgICAgIGlmKCF2YWx1ZSkgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICB2YXIga2V5VmFsdWUgPSBqc29uLnN0cmluZ2lmeShrZXkpXG4gICAgICAgICAgICAgICAgICAgICsgY29sb25TZXBhcmF0b3JcbiAgICAgICAgICAgICAgICAgICAgKyB2YWx1ZTtcbiAgICAgICAgICAgICAgICA7XG4gICAgICAgICAgICAgICAgb3V0LnB1c2goaW5kZW50ICsgc3BhY2UgKyBrZXlWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWVuLnNwbGljZShzZWVuLmluZGV4T2Yobm9kZSksIDEpO1xuICAgICAgICAgICAgcmV0dXJuICd7JyArIG91dC5qb2luKCcsJykgKyBpbmRlbnQgKyAnfSc7XG4gICAgICAgIH1cbiAgICB9KSh7ICcnOiBvYmogfSwgJycsIG9iaiwgMCk7XG59O1xuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHgpIHtcbiAgICByZXR1cm4ge30udG9TdHJpbmcuY2FsbCh4KSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG5cbnZhciBvYmplY3RLZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iaikge1xuICAgIHZhciBoYXMgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5IHx8IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRydWUgfTtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgICAgaWYgKGhhcy5jYWxsKG9iaiwga2V5KSkga2V5cy5wdXNoKGtleSk7XG4gICAgfVxuICAgIHJldHVybiBrZXlzO1xufTtcbiIsImV4cG9ydHMucGFyc2UgPSByZXF1aXJlKCcuL2xpYi9wYXJzZScpO1xuZXhwb3J0cy5zdHJpbmdpZnkgPSByZXF1aXJlKCcuL2xpYi9zdHJpbmdpZnknKTtcbiIsInZhciBhdCwgLy8gVGhlIGluZGV4IG9mIHRoZSBjdXJyZW50IGNoYXJhY3RlclxuICAgIGNoLCAvLyBUaGUgY3VycmVudCBjaGFyYWN0ZXJcbiAgICBlc2NhcGVlID0ge1xuICAgICAgICAnXCInOiAgJ1wiJyxcbiAgICAgICAgJ1xcXFwnOiAnXFxcXCcsXG4gICAgICAgICcvJzogICcvJyxcbiAgICAgICAgYjogICAgJ1xcYicsXG4gICAgICAgIGY6ICAgICdcXGYnLFxuICAgICAgICBuOiAgICAnXFxuJyxcbiAgICAgICAgcjogICAgJ1xccicsXG4gICAgICAgIHQ6ICAgICdcXHQnXG4gICAgfSxcbiAgICB0ZXh0LFxuXG4gICAgZXJyb3IgPSBmdW5jdGlvbiAobSkge1xuICAgICAgICAvLyBDYWxsIGVycm9yIHdoZW4gc29tZXRoaW5nIGlzIHdyb25nLlxuICAgICAgICB0aHJvdyB7XG4gICAgICAgICAgICBuYW1lOiAgICAnU3ludGF4RXJyb3InLFxuICAgICAgICAgICAgbWVzc2FnZTogbSxcbiAgICAgICAgICAgIGF0OiAgICAgIGF0LFxuICAgICAgICAgICAgdGV4dDogICAgdGV4dFxuICAgICAgICB9O1xuICAgIH0sXG4gICAgXG4gICAgbmV4dCA9IGZ1bmN0aW9uIChjKSB7XG4gICAgICAgIC8vIElmIGEgYyBwYXJhbWV0ZXIgaXMgcHJvdmlkZWQsIHZlcmlmeSB0aGF0IGl0IG1hdGNoZXMgdGhlIGN1cnJlbnQgY2hhcmFjdGVyLlxuICAgICAgICBpZiAoYyAmJiBjICE9PSBjaCkge1xuICAgICAgICAgICAgZXJyb3IoXCJFeHBlY3RlZCAnXCIgKyBjICsgXCInIGluc3RlYWQgb2YgJ1wiICsgY2ggKyBcIidcIik7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIEdldCB0aGUgbmV4dCBjaGFyYWN0ZXIuIFdoZW4gdGhlcmUgYXJlIG5vIG1vcmUgY2hhcmFjdGVycyxcbiAgICAgICAgLy8gcmV0dXJuIHRoZSBlbXB0eSBzdHJpbmcuXG4gICAgICAgIFxuICAgICAgICBjaCA9IHRleHQuY2hhckF0KGF0KTtcbiAgICAgICAgYXQgKz0gMTtcbiAgICAgICAgcmV0dXJuIGNoO1xuICAgIH0sXG4gICAgXG4gICAgbnVtYmVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBQYXJzZSBhIG51bWJlciB2YWx1ZS5cbiAgICAgICAgdmFyIG51bWJlcixcbiAgICAgICAgICAgIHN0cmluZyA9ICcnO1xuICAgICAgICBcbiAgICAgICAgaWYgKGNoID09PSAnLScpIHtcbiAgICAgICAgICAgIHN0cmluZyA9ICctJztcbiAgICAgICAgICAgIG5leHQoJy0nKTtcbiAgICAgICAgfVxuICAgICAgICB3aGlsZSAoY2ggPj0gJzAnICYmIGNoIDw9ICc5Jykge1xuICAgICAgICAgICAgc3RyaW5nICs9IGNoO1xuICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaCA9PT0gJy4nKSB7XG4gICAgICAgICAgICBzdHJpbmcgKz0gJy4nO1xuICAgICAgICAgICAgd2hpbGUgKG5leHQoKSAmJiBjaCA+PSAnMCcgJiYgY2ggPD0gJzknKSB7XG4gICAgICAgICAgICAgICAgc3RyaW5nICs9IGNoO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChjaCA9PT0gJ2UnIHx8IGNoID09PSAnRScpIHtcbiAgICAgICAgICAgIHN0cmluZyArPSBjaDtcbiAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICAgIGlmIChjaCA9PT0gJy0nIHx8IGNoID09PSAnKycpIHtcbiAgICAgICAgICAgICAgICBzdHJpbmcgKz0gY2g7XG4gICAgICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2hpbGUgKGNoID49ICcwJyAmJiBjaCA8PSAnOScpIHtcbiAgICAgICAgICAgICAgICBzdHJpbmcgKz0gY2g7XG4gICAgICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG51bWJlciA9ICtzdHJpbmc7XG4gICAgICAgIGlmICghaXNGaW5pdGUobnVtYmVyKSkge1xuICAgICAgICAgICAgZXJyb3IoXCJCYWQgbnVtYmVyXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bWJlcjtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgc3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBQYXJzZSBhIHN0cmluZyB2YWx1ZS5cbiAgICAgICAgdmFyIGhleCxcbiAgICAgICAgICAgIGksXG4gICAgICAgICAgICBzdHJpbmcgPSAnJyxcbiAgICAgICAgICAgIHVmZmZmO1xuICAgICAgICBcbiAgICAgICAgLy8gV2hlbiBwYXJzaW5nIGZvciBzdHJpbmcgdmFsdWVzLCB3ZSBtdXN0IGxvb2sgZm9yIFwiIGFuZCBcXCBjaGFyYWN0ZXJzLlxuICAgICAgICBpZiAoY2ggPT09ICdcIicpIHtcbiAgICAgICAgICAgIHdoaWxlIChuZXh0KCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoY2ggPT09ICdcIicpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RyaW5nO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2ggPT09ICdcXFxcJykge1xuICAgICAgICAgICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaCA9PT0gJ3UnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1ZmZmZiA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgNDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGV4ID0gcGFyc2VJbnQobmV4dCgpLCAxNik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0Zpbml0ZShoZXgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1ZmZmZiA9IHVmZmZmICogMTYgKyBoZXg7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmcgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSh1ZmZmZik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGVzY2FwZWVbY2hdID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RyaW5nICs9IGVzY2FwZWVbY2hdO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzdHJpbmcgKz0gY2g7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVycm9yKFwiQmFkIHN0cmluZ1wiKTtcbiAgICB9LFxuXG4gICAgd2hpdGUgPSBmdW5jdGlvbiAoKSB7XG5cbi8vIFNraXAgd2hpdGVzcGFjZS5cblxuICAgICAgICB3aGlsZSAoY2ggJiYgY2ggPD0gJyAnKSB7XG4gICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgd29yZCA9IGZ1bmN0aW9uICgpIHtcblxuLy8gdHJ1ZSwgZmFsc2UsIG9yIG51bGwuXG5cbiAgICAgICAgc3dpdGNoIChjaCkge1xuICAgICAgICBjYXNlICd0JzpcbiAgICAgICAgICAgIG5leHQoJ3QnKTtcbiAgICAgICAgICAgIG5leHQoJ3InKTtcbiAgICAgICAgICAgIG5leHQoJ3UnKTtcbiAgICAgICAgICAgIG5leHQoJ2UnKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBjYXNlICdmJzpcbiAgICAgICAgICAgIG5leHQoJ2YnKTtcbiAgICAgICAgICAgIG5leHQoJ2EnKTtcbiAgICAgICAgICAgIG5leHQoJ2wnKTtcbiAgICAgICAgICAgIG5leHQoJ3MnKTtcbiAgICAgICAgICAgIG5leHQoJ2UnKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgY2FzZSAnbic6XG4gICAgICAgICAgICBuZXh0KCduJyk7XG4gICAgICAgICAgICBuZXh0KCd1Jyk7XG4gICAgICAgICAgICBuZXh0KCdsJyk7XG4gICAgICAgICAgICBuZXh0KCdsJyk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlcnJvcihcIlVuZXhwZWN0ZWQgJ1wiICsgY2ggKyBcIidcIik7XG4gICAgfSxcblxuICAgIHZhbHVlLCAgLy8gUGxhY2UgaG9sZGVyIGZvciB0aGUgdmFsdWUgZnVuY3Rpb24uXG5cbiAgICBhcnJheSA9IGZ1bmN0aW9uICgpIHtcblxuLy8gUGFyc2UgYW4gYXJyYXkgdmFsdWUuXG5cbiAgICAgICAgdmFyIGFycmF5ID0gW107XG5cbiAgICAgICAgaWYgKGNoID09PSAnWycpIHtcbiAgICAgICAgICAgIG5leHQoJ1snKTtcbiAgICAgICAgICAgIHdoaXRlKCk7XG4gICAgICAgICAgICBpZiAoY2ggPT09ICddJykge1xuICAgICAgICAgICAgICAgIG5leHQoJ10nKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYXJyYXk7ICAgLy8gZW1wdHkgYXJyYXlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdoaWxlIChjaCkge1xuICAgICAgICAgICAgICAgIGFycmF5LnB1c2godmFsdWUoKSk7XG4gICAgICAgICAgICAgICAgd2hpdGUoKTtcbiAgICAgICAgICAgICAgICBpZiAoY2ggPT09ICddJykge1xuICAgICAgICAgICAgICAgICAgICBuZXh0KCddJyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhcnJheTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbmV4dCgnLCcpO1xuICAgICAgICAgICAgICAgIHdoaXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZXJyb3IoXCJCYWQgYXJyYXlcIik7XG4gICAgfSxcblxuICAgIG9iamVjdCA9IGZ1bmN0aW9uICgpIHtcblxuLy8gUGFyc2UgYW4gb2JqZWN0IHZhbHVlLlxuXG4gICAgICAgIHZhciBrZXksXG4gICAgICAgICAgICBvYmplY3QgPSB7fTtcblxuICAgICAgICBpZiAoY2ggPT09ICd7Jykge1xuICAgICAgICAgICAgbmV4dCgneycpO1xuICAgICAgICAgICAgd2hpdGUoKTtcbiAgICAgICAgICAgIGlmIChjaCA9PT0gJ30nKSB7XG4gICAgICAgICAgICAgICAgbmV4dCgnfScpO1xuICAgICAgICAgICAgICAgIHJldHVybiBvYmplY3Q7ICAgLy8gZW1wdHkgb2JqZWN0XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3aGlsZSAoY2gpIHtcbiAgICAgICAgICAgICAgICBrZXkgPSBzdHJpbmcoKTtcbiAgICAgICAgICAgICAgICB3aGl0ZSgpO1xuICAgICAgICAgICAgICAgIG5leHQoJzonKTtcbiAgICAgICAgICAgICAgICBpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yKCdEdXBsaWNhdGUga2V5IFwiJyArIGtleSArICdcIicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvYmplY3Rba2V5XSA9IHZhbHVlKCk7XG4gICAgICAgICAgICAgICAgd2hpdGUoKTtcbiAgICAgICAgICAgICAgICBpZiAoY2ggPT09ICd9Jykge1xuICAgICAgICAgICAgICAgICAgICBuZXh0KCd9Jyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG5leHQoJywnKTtcbiAgICAgICAgICAgICAgICB3aGl0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVycm9yKFwiQmFkIG9iamVjdFwiKTtcbiAgICB9O1xuXG52YWx1ZSA9IGZ1bmN0aW9uICgpIHtcblxuLy8gUGFyc2UgYSBKU09OIHZhbHVlLiBJdCBjb3VsZCBiZSBhbiBvYmplY3QsIGFuIGFycmF5LCBhIHN0cmluZywgYSBudW1iZXIsXG4vLyBvciBhIHdvcmQuXG5cbiAgICB3aGl0ZSgpO1xuICAgIHN3aXRjaCAoY2gpIHtcbiAgICBjYXNlICd7JzpcbiAgICAgICAgcmV0dXJuIG9iamVjdCgpO1xuICAgIGNhc2UgJ1snOlxuICAgICAgICByZXR1cm4gYXJyYXkoKTtcbiAgICBjYXNlICdcIic6XG4gICAgICAgIHJldHVybiBzdHJpbmcoKTtcbiAgICBjYXNlICctJzpcbiAgICAgICAgcmV0dXJuIG51bWJlcigpO1xuICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBjaCA+PSAnMCcgJiYgY2ggPD0gJzknID8gbnVtYmVyKCkgOiB3b3JkKCk7XG4gICAgfVxufTtcblxuLy8gUmV0dXJuIHRoZSBqc29uX3BhcnNlIGZ1bmN0aW9uLiBJdCB3aWxsIGhhdmUgYWNjZXNzIHRvIGFsbCBvZiB0aGUgYWJvdmVcbi8vIGZ1bmN0aW9ucyBhbmQgdmFyaWFibGVzLlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChzb3VyY2UsIHJldml2ZXIpIHtcbiAgICB2YXIgcmVzdWx0O1xuICAgIFxuICAgIHRleHQgPSBzb3VyY2U7XG4gICAgYXQgPSAwO1xuICAgIGNoID0gJyAnO1xuICAgIHJlc3VsdCA9IHZhbHVlKCk7XG4gICAgd2hpdGUoKTtcbiAgICBpZiAoY2gpIHtcbiAgICAgICAgZXJyb3IoXCJTeW50YXggZXJyb3JcIik7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlcmUgaXMgYSByZXZpdmVyIGZ1bmN0aW9uLCB3ZSByZWN1cnNpdmVseSB3YWxrIHRoZSBuZXcgc3RydWN0dXJlLFxuICAgIC8vIHBhc3NpbmcgZWFjaCBuYW1lL3ZhbHVlIHBhaXIgdG8gdGhlIHJldml2ZXIgZnVuY3Rpb24gZm9yIHBvc3NpYmxlXG4gICAgLy8gdHJhbnNmb3JtYXRpb24sIHN0YXJ0aW5nIHdpdGggYSB0ZW1wb3Jhcnkgcm9vdCBvYmplY3QgdGhhdCBob2xkcyB0aGUgcmVzdWx0XG4gICAgLy8gaW4gYW4gZW1wdHkga2V5LiBJZiB0aGVyZSBpcyBub3QgYSByZXZpdmVyIGZ1bmN0aW9uLCB3ZSBzaW1wbHkgcmV0dXJuIHRoZVxuICAgIC8vIHJlc3VsdC5cblxuICAgIHJldHVybiB0eXBlb2YgcmV2aXZlciA9PT0gJ2Z1bmN0aW9uJyA/IChmdW5jdGlvbiB3YWxrKGhvbGRlciwga2V5KSB7XG4gICAgICAgIHZhciBrLCB2LCB2YWx1ZSA9IGhvbGRlcltrZXldO1xuICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgZm9yIChrIGluIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgaykpIHtcbiAgICAgICAgICAgICAgICAgICAgdiA9IHdhbGsodmFsdWUsIGspO1xuICAgICAgICAgICAgICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVtrXSA9IHY7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgdmFsdWVba107XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldml2ZXIuY2FsbChob2xkZXIsIGtleSwgdmFsdWUpO1xuICAgIH0oeycnOiByZXN1bHR9LCAnJykpIDogcmVzdWx0O1xufTtcbiIsInZhciBjeCA9IC9bXFx1MDAwMFxcdTAwYWRcXHUwNjAwLVxcdTA2MDRcXHUwNzBmXFx1MTdiNFxcdTE3YjVcXHUyMDBjLVxcdTIwMGZcXHUyMDI4LVxcdTIwMmZcXHUyMDYwLVxcdTIwNmZcXHVmZWZmXFx1ZmZmMC1cXHVmZmZmXS9nLFxuICAgIGVzY2FwYWJsZSA9IC9bXFxcXFxcXCJcXHgwMC1cXHgxZlxceDdmLVxceDlmXFx1MDBhZFxcdTA2MDAtXFx1MDYwNFxcdTA3MGZcXHUxN2I0XFx1MTdiNVxcdTIwMGMtXFx1MjAwZlxcdTIwMjgtXFx1MjAyZlxcdTIwNjAtXFx1MjA2ZlxcdWZlZmZcXHVmZmYwLVxcdWZmZmZdL2csXG4gICAgZ2FwLFxuICAgIGluZGVudCxcbiAgICBtZXRhID0geyAgICAvLyB0YWJsZSBvZiBjaGFyYWN0ZXIgc3Vic3RpdHV0aW9uc1xuICAgICAgICAnXFxiJzogJ1xcXFxiJyxcbiAgICAgICAgJ1xcdCc6ICdcXFxcdCcsXG4gICAgICAgICdcXG4nOiAnXFxcXG4nLFxuICAgICAgICAnXFxmJzogJ1xcXFxmJyxcbiAgICAgICAgJ1xccic6ICdcXFxccicsXG4gICAgICAgICdcIicgOiAnXFxcXFwiJyxcbiAgICAgICAgJ1xcXFwnOiAnXFxcXFxcXFwnXG4gICAgfSxcbiAgICByZXA7XG5cbmZ1bmN0aW9uIHF1b3RlKHN0cmluZykge1xuICAgIC8vIElmIHRoZSBzdHJpbmcgY29udGFpbnMgbm8gY29udHJvbCBjaGFyYWN0ZXJzLCBubyBxdW90ZSBjaGFyYWN0ZXJzLCBhbmQgbm9cbiAgICAvLyBiYWNrc2xhc2ggY2hhcmFjdGVycywgdGhlbiB3ZSBjYW4gc2FmZWx5IHNsYXAgc29tZSBxdW90ZXMgYXJvdW5kIGl0LlxuICAgIC8vIE90aGVyd2lzZSB3ZSBtdXN0IGFsc28gcmVwbGFjZSB0aGUgb2ZmZW5kaW5nIGNoYXJhY3RlcnMgd2l0aCBzYWZlIGVzY2FwZVxuICAgIC8vIHNlcXVlbmNlcy5cbiAgICBcbiAgICBlc2NhcGFibGUubGFzdEluZGV4ID0gMDtcbiAgICByZXR1cm4gZXNjYXBhYmxlLnRlc3Qoc3RyaW5nKSA/ICdcIicgKyBzdHJpbmcucmVwbGFjZShlc2NhcGFibGUsIGZ1bmN0aW9uIChhKSB7XG4gICAgICAgIHZhciBjID0gbWV0YVthXTtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBjID09PSAnc3RyaW5nJyA/IGMgOlxuICAgICAgICAgICAgJ1xcXFx1JyArICgnMDAwMCcgKyBhLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpKS5zbGljZSgtNCk7XG4gICAgfSkgKyAnXCInIDogJ1wiJyArIHN0cmluZyArICdcIic7XG59XG5cbmZ1bmN0aW9uIHN0cihrZXksIGhvbGRlcikge1xuICAgIC8vIFByb2R1Y2UgYSBzdHJpbmcgZnJvbSBob2xkZXJba2V5XS5cbiAgICB2YXIgaSwgICAgICAgICAgLy8gVGhlIGxvb3AgY291bnRlci5cbiAgICAgICAgaywgICAgICAgICAgLy8gVGhlIG1lbWJlciBrZXkuXG4gICAgICAgIHYsICAgICAgICAgIC8vIFRoZSBtZW1iZXIgdmFsdWUuXG4gICAgICAgIGxlbmd0aCxcbiAgICAgICAgbWluZCA9IGdhcCxcbiAgICAgICAgcGFydGlhbCxcbiAgICAgICAgdmFsdWUgPSBob2xkZXJba2V5XTtcbiAgICBcbiAgICAvLyBJZiB0aGUgdmFsdWUgaGFzIGEgdG9KU09OIG1ldGhvZCwgY2FsbCBpdCB0byBvYnRhaW4gYSByZXBsYWNlbWVudCB2YWx1ZS5cbiAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAgICAgdHlwZW9mIHZhbHVlLnRvSlNPTiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvSlNPTihrZXkpO1xuICAgIH1cbiAgICBcbiAgICAvLyBJZiB3ZSB3ZXJlIGNhbGxlZCB3aXRoIGEgcmVwbGFjZXIgZnVuY3Rpb24sIHRoZW4gY2FsbCB0aGUgcmVwbGFjZXIgdG9cbiAgICAvLyBvYnRhaW4gYSByZXBsYWNlbWVudCB2YWx1ZS5cbiAgICBpZiAodHlwZW9mIHJlcCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YWx1ZSA9IHJlcC5jYWxsKGhvbGRlciwga2V5LCB2YWx1ZSk7XG4gICAgfVxuICAgIFxuICAgIC8vIFdoYXQgaGFwcGVucyBuZXh0IGRlcGVuZHMgb24gdGhlIHZhbHVlJ3MgdHlwZS5cbiAgICBzd2l0Y2ggKHR5cGVvZiB2YWx1ZSkge1xuICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgICAgcmV0dXJuIHF1b3RlKHZhbHVlKTtcbiAgICAgICAgXG4gICAgICAgIGNhc2UgJ251bWJlcic6XG4gICAgICAgICAgICAvLyBKU09OIG51bWJlcnMgbXVzdCBiZSBmaW5pdGUuIEVuY29kZSBub24tZmluaXRlIG51bWJlcnMgYXMgbnVsbC5cbiAgICAgICAgICAgIHJldHVybiBpc0Zpbml0ZSh2YWx1ZSkgPyBTdHJpbmcodmFsdWUpIDogJ251bGwnO1xuICAgICAgICBcbiAgICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICAgIGNhc2UgJ251bGwnOlxuICAgICAgICAgICAgLy8gSWYgdGhlIHZhbHVlIGlzIGEgYm9vbGVhbiBvciBudWxsLCBjb252ZXJ0IGl0IHRvIGEgc3RyaW5nLiBOb3RlOlxuICAgICAgICAgICAgLy8gdHlwZW9mIG51bGwgZG9lcyBub3QgcHJvZHVjZSAnbnVsbCcuIFRoZSBjYXNlIGlzIGluY2x1ZGVkIGhlcmUgaW5cbiAgICAgICAgICAgIC8vIHRoZSByZW1vdGUgY2hhbmNlIHRoYXQgdGhpcyBnZXRzIGZpeGVkIHNvbWVkYXkuXG4gICAgICAgICAgICByZXR1cm4gU3RyaW5nKHZhbHVlKTtcbiAgICAgICAgICAgIFxuICAgICAgICBjYXNlICdvYmplY3QnOlxuICAgICAgICAgICAgaWYgKCF2YWx1ZSkgcmV0dXJuICdudWxsJztcbiAgICAgICAgICAgIGdhcCArPSBpbmRlbnQ7XG4gICAgICAgICAgICBwYXJ0aWFsID0gW107XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEFycmF5LmlzQXJyYXlcbiAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmFwcGx5KHZhbHVlKSA9PT0gJ1tvYmplY3QgQXJyYXldJykge1xuICAgICAgICAgICAgICAgIGxlbmd0aCA9IHZhbHVlLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFydGlhbFtpXSA9IHN0cihpLCB2YWx1ZSkgfHwgJ251bGwnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBKb2luIGFsbCBvZiB0aGUgZWxlbWVudHMgdG9nZXRoZXIsIHNlcGFyYXRlZCB3aXRoIGNvbW1hcywgYW5kXG4gICAgICAgICAgICAgICAgLy8gd3JhcCB0aGVtIGluIGJyYWNrZXRzLlxuICAgICAgICAgICAgICAgIHYgPSBwYXJ0aWFsLmxlbmd0aCA9PT0gMCA/ICdbXScgOiBnYXAgP1xuICAgICAgICAgICAgICAgICAgICAnW1xcbicgKyBnYXAgKyBwYXJ0aWFsLmpvaW4oJyxcXG4nICsgZ2FwKSArICdcXG4nICsgbWluZCArICddJyA6XG4gICAgICAgICAgICAgICAgICAgICdbJyArIHBhcnRpYWwuam9pbignLCcpICsgJ10nO1xuICAgICAgICAgICAgICAgIGdhcCA9IG1pbmQ7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHY7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIElmIHRoZSByZXBsYWNlciBpcyBhbiBhcnJheSwgdXNlIGl0IHRvIHNlbGVjdCB0aGUgbWVtYmVycyB0byBiZVxuICAgICAgICAgICAgLy8gc3RyaW5naWZpZWQuXG4gICAgICAgICAgICBpZiAocmVwICYmIHR5cGVvZiByZXAgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgbGVuZ3RoID0gcmVwLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgayA9IHJlcFtpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBrID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdiA9IHN0cihrLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpYWwucHVzaChxdW90ZShrKSArIChnYXAgPyAnOiAnIDogJzonKSArIHYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gT3RoZXJ3aXNlLCBpdGVyYXRlIHRocm91Z2ggYWxsIG9mIHRoZSBrZXlzIGluIHRoZSBvYmplY3QuXG4gICAgICAgICAgICAgICAgZm9yIChrIGluIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIGspKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2ID0gc3RyKGssIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydGlhbC5wdXNoKHF1b3RlKGspICsgKGdhcCA/ICc6ICcgOiAnOicpICsgdik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgLy8gSm9pbiBhbGwgb2YgdGhlIG1lbWJlciB0ZXh0cyB0b2dldGhlciwgc2VwYXJhdGVkIHdpdGggY29tbWFzLFxuICAgICAgICAvLyBhbmQgd3JhcCB0aGVtIGluIGJyYWNlcy5cblxuICAgICAgICB2ID0gcGFydGlhbC5sZW5ndGggPT09IDAgPyAne30nIDogZ2FwID9cbiAgICAgICAgICAgICd7XFxuJyArIGdhcCArIHBhcnRpYWwuam9pbignLFxcbicgKyBnYXApICsgJ1xcbicgKyBtaW5kICsgJ30nIDpcbiAgICAgICAgICAgICd7JyArIHBhcnRpYWwuam9pbignLCcpICsgJ30nO1xuICAgICAgICBnYXAgPSBtaW5kO1xuICAgICAgICByZXR1cm4gdjtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHZhbHVlLCByZXBsYWNlciwgc3BhY2UpIHtcbiAgICB2YXIgaTtcbiAgICBnYXAgPSAnJztcbiAgICBpbmRlbnQgPSAnJztcbiAgICBcbiAgICAvLyBJZiB0aGUgc3BhY2UgcGFyYW1ldGVyIGlzIGEgbnVtYmVyLCBtYWtlIGFuIGluZGVudCBzdHJpbmcgY29udGFpbmluZyB0aGF0XG4gICAgLy8gbWFueSBzcGFjZXMuXG4gICAgaWYgKHR5cGVvZiBzcGFjZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHNwYWNlOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGluZGVudCArPSAnICc7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gSWYgdGhlIHNwYWNlIHBhcmFtZXRlciBpcyBhIHN0cmluZywgaXQgd2lsbCBiZSB1c2VkIGFzIHRoZSBpbmRlbnQgc3RyaW5nLlxuICAgIGVsc2UgaWYgKHR5cGVvZiBzcGFjZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgaW5kZW50ID0gc3BhY2U7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlcmUgaXMgYSByZXBsYWNlciwgaXQgbXVzdCBiZSBhIGZ1bmN0aW9uIG9yIGFuIGFycmF5LlxuICAgIC8vIE90aGVyd2lzZSwgdGhyb3cgYW4gZXJyb3IuXG4gICAgcmVwID0gcmVwbGFjZXI7XG4gICAgaWYgKHJlcGxhY2VyICYmIHR5cGVvZiByZXBsYWNlciAhPT0gJ2Z1bmN0aW9uJ1xuICAgICYmICh0eXBlb2YgcmVwbGFjZXIgIT09ICdvYmplY3QnIHx8IHR5cGVvZiByZXBsYWNlci5sZW5ndGggIT09ICdudW1iZXInKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0pTT04uc3RyaW5naWZ5Jyk7XG4gICAgfVxuICAgIFxuICAgIC8vIE1ha2UgYSBmYWtlIHJvb3Qgb2JqZWN0IGNvbnRhaW5pbmcgb3VyIHZhbHVlIHVuZGVyIHRoZSBrZXkgb2YgJycuXG4gICAgLy8gUmV0dXJuIHRoZSByZXN1bHQgb2Ygc3RyaW5naWZ5aW5nIHRoZSB2YWx1ZS5cbiAgICByZXR1cm4gc3RyKCcnLCB7Jyc6IHZhbHVlfSk7XG59O1xuIiwiXG5leHBvcnQgZW51bSBBZ2dyZWdhdGVPcCB7XG4gICAgVkFMVUVTID0gJ3ZhbHVlcycgYXMgYW55LFxuICAgIENPVU5UID0gJ2NvdW50JyBhcyBhbnksXG4gICAgVkFMSUQgPSAndmFsaWQnIGFzIGFueSxcbiAgICBNSVNTSU5HID0gJ21pc3NpbmcnIGFzIGFueSxcbiAgICBESVNUSU5DVCA9ICdkaXN0aW5jdCcgYXMgYW55LFxuICAgIFNVTSA9ICdzdW0nIGFzIGFueSxcbiAgICBNRUFOID0gJ21lYW4nIGFzIGFueSxcbiAgICBBVkVSQUdFID0gJ2F2ZXJhZ2UnIGFzIGFueSxcbiAgICBWQVJJQU5DRSA9ICd2YXJpYW5jZScgYXMgYW55LFxuICAgIFZBUklBTkNFUCA9ICd2YXJpYW5jZXAnIGFzIGFueSxcbiAgICBTVERFViA9ICdzdGRldicgYXMgYW55LFxuICAgIFNUREVWUCA9ICdzdGRldnAnIGFzIGFueSxcbiAgICBNRURJQU4gPSAnbWVkaWFuJyBhcyBhbnksXG4gICAgUTEgPSAncTEnIGFzIGFueSxcbiAgICBRMyA9ICdxMycgYXMgYW55LFxuICAgIE1PREVTS0VXID0gJ21vZGVza2V3JyBhcyBhbnksXG4gICAgTUlOID0gJ21pbicgYXMgYW55LFxuICAgIE1BWCA9ICdtYXgnIGFzIGFueSxcbiAgICBBUkdNSU4gPSAnYXJnbWluJyBhcyBhbnksXG4gICAgQVJHTUFYID0gJ2FyZ21heCcgYXMgYW55LFxuICAgIEJPWE1JTk1BWCA9ICdib3hNaW5NYXgnIGFzIGFueSxcbn1cblxuZXhwb3J0IGNvbnN0IEFHR1JFR0FURV9PUFMgPSBbXG4gICAgQWdncmVnYXRlT3AuVkFMVUVTLFxuICAgIEFnZ3JlZ2F0ZU9wLkNPVU5ULFxuICAgIEFnZ3JlZ2F0ZU9wLlZBTElELFxuICAgIEFnZ3JlZ2F0ZU9wLk1JU1NJTkcsXG4gICAgQWdncmVnYXRlT3AuRElTVElOQ1QsXG4gICAgQWdncmVnYXRlT3AuU1VNLFxuICAgIEFnZ3JlZ2F0ZU9wLk1FQU4sXG4gICAgQWdncmVnYXRlT3AuQVZFUkFHRSxcbiAgICBBZ2dyZWdhdGVPcC5WQVJJQU5DRSxcbiAgICBBZ2dyZWdhdGVPcC5WQVJJQU5DRVAsXG4gICAgQWdncmVnYXRlT3AuU1RERVYsXG4gICAgQWdncmVnYXRlT3AuU1RERVZQLFxuICAgIEFnZ3JlZ2F0ZU9wLk1FRElBTixcbiAgICBBZ2dyZWdhdGVPcC5RMSxcbiAgICBBZ2dyZWdhdGVPcC5RMyxcbiAgICBBZ2dyZWdhdGVPcC5NT0RFU0tFVyxcbiAgICBBZ2dyZWdhdGVPcC5NSU4sXG4gICAgQWdncmVnYXRlT3AuTUFYLFxuICAgIEFnZ3JlZ2F0ZU9wLkFSR01JTixcbiAgICBBZ2dyZWdhdGVPcC5BUkdNQVgsXG4gICAgQWdncmVnYXRlT3AuQk9YTUlOTUFYXG5dO1xuXG5leHBvcnQgY29uc3QgU0hBUkVEX0RPTUFJTl9PUFMgPSBbXG4gICAgQWdncmVnYXRlT3AuTUVBTixcbiAgICBBZ2dyZWdhdGVPcC5BVkVSQUdFLFxuICAgIEFnZ3JlZ2F0ZU9wLlNUREVWLFxuICAgIEFnZ3JlZ2F0ZU9wLlNUREVWUCxcbiAgICBBZ2dyZWdhdGVPcC5NRURJQU4sXG4gICAgQWdncmVnYXRlT3AuUTEsXG4gICAgQWdncmVnYXRlT3AuUTMsXG4gICAgQWdncmVnYXRlT3AuTUlOLFxuICAgIEFnZ3JlZ2F0ZU9wLk1BWCxcbl07XG5cbi8vIFRPRE86IG1vdmUgc3VwcG9ydGVkVHlwZXMsIHN1cHBvcnRlZEVudW1zIGZyb20gc2NoZW1hIHRvIGhlcmVcbiIsIlxuZXhwb3J0IGVudW0gQXhpc09yaWVudCB7XG4gICAgVE9QID0gJ3RvcCcgYXMgYW55LFxuICAgIFJJR0hUID0gJ3JpZ2h0JyBhcyBhbnksXG4gICAgTEVGVCA9ICdsZWZ0JyBhcyBhbnksXG4gICAgQk9UVE9NID0gJ2JvdHRvbScgYXMgYW55XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXhpc0NvbmZpZyB7XG4gIC8vIC0tLS0tLS0tLS0gR2VuZXJhbCAtLS0tLS0tLS0tXG4gIC8qKlxuICAgKiBXaWR0aCBvZiB0aGUgYXhpcyBsaW5lXG4gICAqL1xuICBheGlzV2lkdGg/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBBIHN0cmluZyBpbmRpY2F0aW5nIGlmIHRoZSBheGlzIChhbmQgYW55IGdyaWRsaW5lcykgc2hvdWxkIGJlIHBsYWNlZCBhYm92ZSBvciBiZWxvdyB0aGUgZGF0YSBtYXJrcy5cbiAgICovXG4gIGxheWVyPzogc3RyaW5nO1xuICAvKipcbiAgICogVGhlIG9mZnNldCwgaW4gcGl4ZWxzLCBieSB3aGljaCB0byBkaXNwbGFjZSB0aGUgYXhpcyBmcm9tIHRoZSBlZGdlIG9mIHRoZSBlbmNsb3NpbmcgZ3JvdXAgb3IgZGF0YSByZWN0YW5nbGUuXG4gICAqL1xuICBvZmZzZXQ/OiBudW1iZXI7XG5cbiAgLy8gLS0tLS0tLS0tLSBBeGlzIC0tLS0tLS0tLS1cbiAgLyoqXG4gICAqIENvbG9yIG9mIGF4aXMgbGluZS5cbiAgICovXG4gIGF4aXNDb2xvcj86IHN0cmluZztcblxuICAvLyAtLS0tLS0tLS0tIEdyaWQgLS0tLS0tLS0tLVxuICAvKipcbiAgICogQSBmbGFnIGluZGljYXRlIGlmIGdyaWRsaW5lcyBzaG91bGQgYmUgY3JlYXRlZCBpbiBhZGRpdGlvbiB0byB0aWNrcy4gSWYgYGdyaWRgIGlzIHVuc3BlY2lmaWVkLCB0aGUgZGVmYXVsdCB2YWx1ZSBpcyBgdHJ1ZWAgZm9yIFJPVyBhbmQgQ09MLiBGb3IgWCBhbmQgWSwgdGhlIGRlZmF1bHQgdmFsdWUgaXMgYHRydWVgIGZvciBxdWFudGl0YXRpdmUgYW5kIHRpbWUgZmllbGRzIGFuZCBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICovXG4gIGdyaWQ/OiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBDb2xvciBvZiBncmlkbGluZXMuXG4gICAqL1xuICBncmlkQ29sb3I/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSBvZmZzZXQgKGluIHBpeGVscykgaW50byB3aGljaCB0byBiZWdpbiBkcmF3aW5nIHdpdGggdGhlIGdyaWQgZGFzaCBhcnJheS5cbiAgICovXG4gIGdyaWREYXNoPzogbnVtYmVyW107XG5cbiAgLyoqXG4gICAqIFRoZSBzdHJva2Ugb3BhY2l0eSBvZiBncmlkICh2YWx1ZSBiZXR3ZWVuIFswLDFdKVxuICAgKi9cbiAgZ3JpZE9wYWNpdHk/OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFRoZSBncmlkIHdpZHRoLCBpbiBwaXhlbHMuXG4gICAqL1xuICBncmlkV2lkdGg/OiBudW1iZXI7XG5cbiAgLy8gLS0tLS0tLS0tLSBMYWJlbHMgLS0tLS0tLS0tLVxuICAvKipcbiAgICogRW5hYmxlIG9yIGRpc2FibGUgbGFiZWxzLlxuICAgKi9cbiAgbGFiZWxzPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIFRoZSByb3RhdGlvbiBhbmdsZSBvZiB0aGUgYXhpcyBsYWJlbHMuXG4gICAqL1xuICBsYWJlbEFuZ2xlPzogbnVtYmVyO1xuICAvKipcbiAgICogVGV4dCBhbGlnbm1lbnQgZm9yIHRoZSBMYWJlbC5cbiAgICovXG4gIGxhYmVsQWxpZ24/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBUZXh0IGJhc2VsaW5lIGZvciB0aGUgbGFiZWwuXG4gICAqL1xuICBsYWJlbEJhc2VsaW5lPzogc3RyaW5nO1xuICAvKipcbiAgICogVHJ1bmNhdGUgbGFiZWxzIHRoYXQgYXJlIHRvbyBsb25nLlxuICAgKiBAbWluaW11bSAxXG4gICAqL1xuICBsYWJlbE1heExlbmd0aD86IG51bWJlcjtcbiAgLyoqXG4gICAqIFdoZXRoZXIgbW9udGggYW5kIGRheSBuYW1lcyBzaG91bGQgYmUgYWJicmV2aWF0ZWQuXG4gICAqL1xuICBzaG9ydFRpbWVMYWJlbHM/OiBib29sZWFuO1xuXG4gIC8vIC0tLS0tLS0tLS0gVGlja3MgLS0tLS0tLS0tLVxuICAvKipcbiAgICogSWYgcHJvdmlkZWQsIHNldHMgdGhlIG51bWJlciBvZiBtaW5vciB0aWNrcyBiZXR3ZWVuIG1ham9yIHRpY2tzICh0aGUgdmFsdWUgOSByZXN1bHRzIGluIGRlY2ltYWwgc3ViZGl2aXNpb24pLiBPbmx5IGFwcGxpY2FibGUgZm9yIGF4ZXMgdmlzdWFsaXppbmcgcXVhbnRpdGF0aXZlIHNjYWxlcy5cbiAgICovXG4gIHN1YmRpdmlkZT86IG51bWJlcjtcbiAgLyoqXG4gICAqIEEgZGVzaXJlZCBudW1iZXIgb2YgdGlja3MsIGZvciBheGVzIHZpc3VhbGl6aW5nIHF1YW50aXRhdGl2ZSBzY2FsZXMuIFRoZSByZXN1bHRpbmcgbnVtYmVyIG1heSBiZSBkaWZmZXJlbnQgc28gdGhhdCB2YWx1ZXMgYXJlIFwibmljZVwiIChtdWx0aXBsZXMgb2YgMiwgNSwgMTApIGFuZCBsaWUgd2l0aGluIHRoZSB1bmRlcmx5aW5nIHNjYWxlJ3MgcmFuZ2UuXG4gICAqIEBtaW5pbXVtIDBcbiAgICovXG4gIHRpY2tzPzogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBUaGUgY29sb3Igb2YgdGhlIGF4aXMncyB0aWNrLlxuICAgKi9cbiAgdGlja0NvbG9yPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgY29sb3Igb2YgdGhlIHRpY2sgbGFiZWwsIGNhbiBiZSBpbiBoZXggY29sb3IgY29kZSBvciByZWd1bGFyIGNvbG9yIG5hbWUuXG4gICAqL1xuICB0aWNrTGFiZWxDb2xvcj86IHN0cmluZztcblxuICAvKipcbiAgICogVGhlIGZvbnQgb2YgdGhlIHRpY2sgbGFiZWwuXG4gICAqL1xuICB0aWNrTGFiZWxGb250Pzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgZm9udCBzaXplIG9mIGxhYmVsLCBpbiBwaXhlbHMuXG4gICAqL1xuICB0aWNrTGFiZWxGb250U2l6ZT86IG51bWJlcjtcblxuICAvKipcbiAgICogVGhlIHBhZGRpbmcsIGluIHBpeGVscywgYmV0d2VlbiB0aWNrcyBhbmQgdGV4dCBsYWJlbHMuXG4gICAqL1xuICB0aWNrUGFkZGluZz86IG51bWJlcjtcbiAgLyoqXG4gICAqIFRoZSBzaXplLCBpbiBwaXhlbHMsIG9mIG1ham9yLCBtaW5vciBhbmQgZW5kIHRpY2tzLlxuICAgKiBAbWluaW11bSAwXG4gICAqL1xuICB0aWNrU2l6ZT86IG51bWJlcjtcbiAgLyoqXG4gICAqIFRoZSBzaXplLCBpbiBwaXhlbHMsIG9mIG1ham9yIHRpY2tzLlxuICAgKiBAbWluaW11bSAwXG4gICAqL1xuICB0aWNrU2l6ZU1ham9yPzogbnVtYmVyO1xuICAvKipcbiAgICogVGhlIHNpemUsIGluIHBpeGVscywgb2YgbWlub3IgdGlja3MuXG4gICAqIEBtaW5pbXVtIDBcbiAgICovXG4gIHRpY2tTaXplTWlub3I/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBUaGUgc2l6ZSwgaW4gcGl4ZWxzLCBvZiBlbmQgdGlja3MuXG4gICAqIEBtaW5pbXVtIDBcbiAgICovXG4gIHRpY2tTaXplRW5kPzogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBUaGUgd2lkdGgsIGluIHBpeGVscywgb2YgdGlja3MuXG4gICAqL1xuICB0aWNrV2lkdGg/OiBudW1iZXI7XG5cbiAgLy8gLS0tLS0tLS0tLSBUaXRsZSAtLS0tLS0tLS0tXG4gIC8qKlxuICAgKiBDb2xvciBvZiB0aGUgdGl0bGUsIGNhbiBiZSBpbiBoZXggY29sb3IgY29kZSBvciByZWd1bGFyIGNvbG9yIG5hbWUuXG4gICAqL1xuICB0aXRsZUNvbG9yPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBGb250IG9mIHRoZSB0aXRsZS5cbiAgICovXG4gIHRpdGxlRm9udD86IHN0cmluZztcblxuICAvKipcbiAgICogU2l6ZSBvZiB0aGUgdGl0bGUuXG4gICAqL1xuICB0aXRsZUZvbnRTaXplPzogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBXZWlnaHQgb2YgdGhlIHRpdGxlLlxuICAgKi9cbiAgdGl0bGVGb250V2VpZ2h0Pzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBBIHRpdGxlIG9mZnNldCB2YWx1ZSBmb3IgdGhlIGF4aXMuXG4gICAqL1xuICB0aXRsZU9mZnNldD86IG51bWJlcjtcbiAgLyoqXG4gICAqIE1heCBsZW5ndGggZm9yIGF4aXMgdGl0bGUgaWYgdGhlIHRpdGxlIGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkIGZyb20gdGhlIGZpZWxkJ3MgZGVzY3JpcHRpb24uIEJ5IGRlZmF1bHQsIHRoaXMgaXMgYXV0b21hdGljYWxseSBiYXNlZCBvbiBjZWxsIHNpemUgYW5kIGNoYXJhY3RlcldpZHRoIHByb3BlcnR5LlxuICAgKiBAbWluaW11bSAwXG4gICAqL1xuICB0aXRsZU1heExlbmd0aD86IG51bWJlcjtcbiAgLyoqXG4gICAqIENoYXJhY3RlciB3aWR0aCBmb3IgYXV0b21hdGljYWxseSBkZXRlcm1pbmluZyB0aXRsZSBtYXggbGVuZ3RoLlxuICAgKi9cbiAgY2hhcmFjdGVyV2lkdGg/OiBudW1iZXI7XG5cbiAgLy8gLS0tLS0tLS0tLSBPdGhlciAtLS0tLS0tLS0tXG4gIC8qKlxuICAgKiBPcHRpb25hbCBtYXJrIHByb3BlcnR5IGRlZmluaXRpb25zIGZvciBjdXN0b20gYXhpcyBzdHlsaW5nLlxuICAgKi9cbiAgcHJvcGVydGllcz86IGFueTsgLy8gVE9ETzogcmVwbGFjZVxufVxuXG4vLyBUT0RPOiBhZGQgY29tbWVudCBmb3IgcHJvcGVydGllcyB0aGF0IHdlIHJlbHkgb24gVmVnYSdzIGRlZmF1bHQgdG8gcHJvZHVjZVxuLy8gbW9yZSBjb25jaXNlIFZlZ2Egb3V0cHV0LlxuXG5leHBvcnQgY29uc3QgZGVmYXVsdEF4aXNDb25maWc6IEF4aXNDb25maWcgPSB7XG4gIG9mZnNldDogdW5kZWZpbmVkLCAvLyBpbXBsaWNpdGx5IDBcbiAgZ3JpZDogdW5kZWZpbmVkLCAvLyBhdXRvbWF0aWNhbGx5IGRldGVybWluZWRcbiAgbGFiZWxzOiB0cnVlLFxuICBsYWJlbE1heExlbmd0aDogMjUsXG4gIHRpY2tTaXplOiB1bmRlZmluZWQsIC8vIGltcGxpY2l0bHkgNlxuICBjaGFyYWN0ZXJXaWR0aDogNlxufTtcblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRGYWNldEF4aXNDb25maWc6IEF4aXNDb25maWcgPSB7XG4gIGF4aXNXaWR0aDogMCxcbiAgbGFiZWxzOiB0cnVlLFxuICBncmlkOiBmYWxzZSxcbiAgdGlja1NpemU6IDBcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXhpcyBleHRlbmRzIEF4aXNDb25maWcge1xuICAvKipcbiAgICogVGhlIHJvdGF0aW9uIGFuZ2xlIG9mIHRoZSBheGlzIGxhYmVscy5cbiAgICovXG4gIGxhYmVsQW5nbGU/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBUaGUgZm9ybWF0dGluZyBwYXR0ZXJuIGZvciBheGlzIGxhYmVscy5cbiAgICovXG4gIGZvcm1hdD86IHN0cmluZzsgLy8gZGVmYXVsdCB2YWx1ZSBkZXRlcm1pbmVkIGJ5IGNvbmZpZy5mb3JtYXQgYW55d2F5XG4gIC8qKlxuICAgKiBUaGUgb3JpZW50YXRpb24gb2YgdGhlIGF4aXMuIE9uZSBvZiB0b3AsIGJvdHRvbSwgbGVmdCBvciByaWdodC4gVGhlIG9yaWVudGF0aW9uIGNhbiBiZSB1c2VkIHRvIGZ1cnRoZXIgc3BlY2lhbGl6ZSB0aGUgYXhpcyB0eXBlIChlLmcuLCBhIHkgYXhpcyBvcmllbnRlZCBmb3IgdGhlIHJpZ2h0IGVkZ2Ugb2YgdGhlIGNoYXJ0KS5cbiAgICovXG4gIG9yaWVudD86IEF4aXNPcmllbnQ7XG4gIC8qKlxuICAgKiBBIHRpdGxlIGZvciB0aGUgYXhpcy4gU2hvd3MgZmllbGQgbmFtZSBhbmQgaXRzIGZ1bmN0aW9uIGJ5IGRlZmF1bHQuXG4gICAqL1xuICB0aXRsZT86IHN0cmluZztcbiAgdmFsdWVzPzogbnVtYmVyW107XG59XG4iLCJpbXBvcnQge0NoYW5uZWwsIFJPVywgQ09MVU1OLCBTSEFQRSwgU0laRX0gZnJvbSAnLi9jaGFubmVsJztcblxuLyoqXG4gKiBCaW5uaW5nIHByb3BlcnRpZXMgb3IgYm9vbGVhbiBmbGFnIGZvciBkZXRlcm1pbmluZyB3aGV0aGVyIHRvIGJpbiBkYXRhIG9yIG5vdC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBCaW4ge1xuICAvKipcbiAgICogVGhlIG1pbmltdW0gYmluIHZhbHVlIHRvIGNvbnNpZGVyLiBJZiB1bnNwZWNpZmllZCwgdGhlIG1pbmltdW0gdmFsdWUgb2YgdGhlIHNwZWNpZmllZCBmaWVsZCBpcyB1c2VkLlxuICAgKi9cbiAgbWluPzogbnVtYmVyO1xuICAvKipcbiAgICogVGhlIG1heGltdW0gYmluIHZhbHVlIHRvIGNvbnNpZGVyLiBJZiB1bnNwZWNpZmllZCwgdGhlIG1heGltdW0gdmFsdWUgb2YgdGhlIHNwZWNpZmllZCBmaWVsZCBpcyB1c2VkLlxuICAgKi9cbiAgbWF4PzogbnVtYmVyO1xuICAvKipcbiAgICogVGhlIG51bWJlciBiYXNlIHRvIHVzZSBmb3IgYXV0b21hdGljIGJpbiBkZXRlcm1pbmF0aW9uIChkZWZhdWx0IGlzIGJhc2UgMTApLlxuICAgKi9cbiAgYmFzZT86IG51bWJlcjtcbiAgLyoqXG4gICAqIEFuIGV4YWN0IHN0ZXAgc2l6ZSB0byB1c2UgYmV0d2VlbiBiaW5zLiBJZiBwcm92aWRlZCwgb3B0aW9ucyBzdWNoIGFzIG1heGJpbnMgd2lsbCBiZSBpZ25vcmVkLlxuICAgKi9cbiAgc3RlcD86IG51bWJlcjtcbiAgLyoqXG4gICAqIEFuIGFycmF5IG9mIGFsbG93YWJsZSBzdGVwIHNpemVzIHRvIGNob29zZSBmcm9tLlxuICAgKi9cbiAgc3RlcHM/OiBudW1iZXJbXTtcbiAgLyoqXG4gICAqIEEgbWluaW11bSBhbGxvd2FibGUgc3RlcCBzaXplIChwYXJ0aWN1bGFybHkgdXNlZnVsIGZvciBpbnRlZ2VyIHZhbHVlcykuXG4gICAqL1xuICBtaW5zdGVwPzogbnVtYmVyO1xuICAvKipcbiAgICogU2NhbGUgZmFjdG9ycyBpbmRpY2F0aW5nIGFsbG93YWJsZSBzdWJkaXZpc2lvbnMuIFRoZSBkZWZhdWx0IHZhbHVlIGlzIFs1LCAyXSwgd2hpY2ggaW5kaWNhdGVzIHRoYXQgZm9yIGJhc2UgMTAgbnVtYmVycyAodGhlIGRlZmF1bHQgYmFzZSksIHRoZSBtZXRob2QgbWF5IGNvbnNpZGVyIGRpdmlkaW5nIGJpbiBzaXplcyBieSA1IGFuZC9vciAyLiBGb3IgZXhhbXBsZSwgZm9yIGFuIGluaXRpYWwgc3RlcCBzaXplIG9mIDEwLCB0aGUgbWV0aG9kIGNhbiBjaGVjayBpZiBiaW4gc2l6ZXMgb2YgMiAoPSAxMC81KSwgNSAoPSAxMC8yKSwgb3IgMSAoPSAxMC8oNSoyKSkgbWlnaHQgYWxzbyBzYXRpc2Z5IHRoZSBnaXZlbiBjb25zdHJhaW50cy5cbiAgICovXG4gIGRpdj86IG51bWJlcltdO1xuICAvKipcbiAgICogTWF4aW11bSBudW1iZXIgb2YgYmlucy5cbiAgICogQG1pbmltdW0gMlxuICAgKi9cbiAgbWF4Ymlucz86IG51bWJlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGF1dG9NYXhCaW5zKGNoYW5uZWw6IENoYW5uZWwpOiBudW1iZXIge1xuICBzd2l0Y2ggKGNoYW5uZWwpIHtcbiAgICBjYXNlIFJPVzpcbiAgICBjYXNlIENPTFVNTjpcbiAgICBjYXNlIFNJWkU6XG4gICAgICAvLyBGYWNldHMgYW5kIFNpemUgc2hvdWxkbid0IGhhdmUgdG9vIG1hbnkgYmluc1xuICAgICAgLy8gV2UgY2hvb3NlIDYgbGlrZSBzaGFwZSB0byBzaW1wbGlmeSB0aGUgcnVsZVxuICAgIGNhc2UgU0hBUEU6XG4gICAgICByZXR1cm4gNjsgLy8gVmVnYSdzIFwic2hhcGVcIiBoYXMgNiBkaXN0aW5jdCB2YWx1ZXNcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIDEwO1xuICB9XG59XG4iLCIvKlxuICogQ29uc3RhbnRzIGFuZCB1dGlsaXRpZXMgZm9yIGVuY29kaW5nIGNoYW5uZWxzIChWaXN1YWwgdmFyaWFibGVzKVxuICogc3VjaCBhcyAneCcsICd5JywgJ2NvbG9yJy5cbiAqL1xuXG5pbXBvcnQge01hcmt9IGZyb20gJy4vbWFyayc7XG5pbXBvcnQge2NvbnRhaW5zLCB3aXRob3V0fSBmcm9tICcuL3V0aWwnO1xuXG5leHBvcnQgZW51bSBDaGFubmVsIHtcbiAgWCA9ICd4JyBhcyBhbnksXG4gIFkgPSAneScgYXMgYW55LFxuICBYMiA9ICd4MicgYXMgYW55LFxuICBZMiA9ICd5MicgYXMgYW55LFxuICBST1cgPSAncm93JyBhcyBhbnksXG4gIENPTFVNTiA9ICdjb2x1bW4nIGFzIGFueSxcbiAgU0hBUEUgPSAnc2hhcGUnIGFzIGFueSxcbiAgU0laRSA9ICdzaXplJyBhcyBhbnksXG4gIENPTE9SID0gJ2NvbG9yJyBhcyBhbnksXG4gIFRFWFQgPSAndGV4dCcgYXMgYW55LFxuICBERVRBSUwgPSAnZGV0YWlsJyBhcyBhbnksXG4gIExBQkVMID0gJ2xhYmVsJyBhcyBhbnksXG4gIFBBVEggPSAncGF0aCcgYXMgYW55LFxuICBPUkRFUiA9ICdvcmRlcicgYXMgYW55LFxuICBPUEFDSVRZID0gJ29wYWNpdHknIGFzIGFueVxufVxuXG5leHBvcnQgY29uc3QgWCA9IENoYW5uZWwuWDtcbmV4cG9ydCBjb25zdCBZID0gQ2hhbm5lbC5ZO1xuZXhwb3J0IGNvbnN0IFgyID0gQ2hhbm5lbC5YMjtcbmV4cG9ydCBjb25zdCBZMiA9IENoYW5uZWwuWTI7XG5leHBvcnQgY29uc3QgUk9XID0gQ2hhbm5lbC5ST1c7XG5leHBvcnQgY29uc3QgQ09MVU1OID0gQ2hhbm5lbC5DT0xVTU47XG5leHBvcnQgY29uc3QgU0hBUEUgPSBDaGFubmVsLlNIQVBFO1xuZXhwb3J0IGNvbnN0IFNJWkUgPSBDaGFubmVsLlNJWkU7XG5leHBvcnQgY29uc3QgQ09MT1IgPSBDaGFubmVsLkNPTE9SO1xuZXhwb3J0IGNvbnN0IFRFWFQgPSBDaGFubmVsLlRFWFQ7XG5leHBvcnQgY29uc3QgREVUQUlMID0gQ2hhbm5lbC5ERVRBSUw7XG5leHBvcnQgY29uc3QgTEFCRUwgPSBDaGFubmVsLkxBQkVMO1xuZXhwb3J0IGNvbnN0IFBBVEggPSBDaGFubmVsLlBBVEg7XG5leHBvcnQgY29uc3QgT1JERVIgPSBDaGFubmVsLk9SREVSO1xuZXhwb3J0IGNvbnN0IE9QQUNJVFkgPSBDaGFubmVsLk9QQUNJVFk7XG5cbmV4cG9ydCBjb25zdCBDSEFOTkVMUyA9IFtYLCBZLCBYMiwgWTIsIFJPVywgQ09MVU1OLCBTSVpFLCBTSEFQRSwgQ09MT1IsIFBBVEgsIE9SREVSLCBPUEFDSVRZLCBURVhULCBERVRBSUwsIExBQkVMXTtcblxuZXhwb3J0IGNvbnN0IFVOSVRfQ0hBTk5FTFMgPSB3aXRob3V0KENIQU5ORUxTLCBbUk9XLCBDT0xVTU5dKTtcbmV4cG9ydCBjb25zdCBVTklUX1NDQUxFX0NIQU5ORUxTID0gd2l0aG91dChVTklUX0NIQU5ORUxTLCBbUEFUSCwgT1JERVIsIERFVEFJTCwgVEVYVCwgTEFCRUwsIFgyLCBZMl0pO1xuZXhwb3J0IGNvbnN0IE5PTlNQQVRJQUxfQ0hBTk5FTFMgPSB3aXRob3V0KFVOSVRfQ0hBTk5FTFMsIFtYLCBZLCBYMiwgWTJdKTtcbmV4cG9ydCBjb25zdCBOT05TUEFUSUFMX1NDQUxFX0NIQU5ORUxTID0gd2l0aG91dChVTklUX1NDQUxFX0NIQU5ORUxTLCBbWCwgWSwgWDIsIFkyXSk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3VwcG9ydGVkTWFyayB7XG4gIHBvaW50PzogYm9vbGVhbjtcbiAgdGljaz86IGJvb2xlYW47XG4gIHJ1bGU/OiBib29sZWFuO1xuICBjaXJjbGU/OiBib29sZWFuO1xuICBzcXVhcmU/OiBib29sZWFuO1xuICBiYXI/OiBib29sZWFuO1xuICBsaW5lPzogYm9vbGVhbjtcbiAgYXJlYT86IGJvb2xlYW47XG4gIHRleHQ/OiBib29sZWFuO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gd2hldGhlciBhIGNoYW5uZWwgc3VwcG9ydHMgYSBwYXJ0aWN1bGFyIG1hcmsgdHlwZS5cbiAqIEBwYXJhbSBjaGFubmVsICBjaGFubmVsIG5hbWVcbiAqIEBwYXJhbSBtYXJrIHRoZSBtYXJrIHR5cGVcbiAqIEByZXR1cm4gd2hldGhlciB0aGUgbWFyayBzdXBwb3J0cyB0aGUgY2hhbm5lbFxuICovXG5leHBvcnQgZnVuY3Rpb24gc3VwcG9ydE1hcmsoY2hhbm5lbDogQ2hhbm5lbCwgbWFyazogTWFyaykge1xuICByZXR1cm4gISFnZXRTdXBwb3J0ZWRNYXJrKGNoYW5uZWwpW21hcmtdO1xufVxuXG4vKipcbiAqIFJldHVybiBhIGRpY3Rpb25hcnkgc2hvd2luZyB3aGV0aGVyIGEgY2hhbm5lbCBzdXBwb3J0cyBtYXJrIHR5cGUuXG4gKiBAcGFyYW0gY2hhbm5lbFxuICogQHJldHVybiBBIGRpY3Rpb25hcnkgbWFwcGluZyBtYXJrIHR5cGVzIHRvIGJvb2xlYW4gdmFsdWVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U3VwcG9ydGVkTWFyayhjaGFubmVsOiBDaGFubmVsKTogU3VwcG9ydGVkTWFyayB7XG4gIHN3aXRjaCAoY2hhbm5lbCkge1xuICAgIGNhc2UgWDpcbiAgICBjYXNlIFk6XG4gICAgY2FzZSBDT0xPUjpcbiAgICBjYXNlIERFVEFJTDpcbiAgICBjYXNlIE9SREVSOlxuICAgIGNhc2UgT1BBQ0lUWTpcbiAgICBjYXNlIFJPVzpcbiAgICBjYXNlIENPTFVNTjpcbiAgICAgIHJldHVybiB7IC8vIGFsbCBtYXJrc1xuICAgICAgICBwb2ludDogdHJ1ZSwgdGljazogdHJ1ZSwgcnVsZTogdHJ1ZSwgY2lyY2xlOiB0cnVlLCBzcXVhcmU6IHRydWUsXG4gICAgICAgIGJhcjogdHJ1ZSwgbGluZTogdHJ1ZSwgYXJlYTogdHJ1ZSwgdGV4dDogdHJ1ZVxuICAgICAgfTtcbiAgICBjYXNlIFgyOlxuICAgIGNhc2UgWTI6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBydWxlOiB0cnVlLCBiYXI6IHRydWUsIGFyZWE6IHRydWVcbiAgICAgIH07XG4gICAgY2FzZSBTSVpFOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcG9pbnQ6IHRydWUsIHRpY2s6IHRydWUsIHJ1bGU6IHRydWUsIGNpcmNsZTogdHJ1ZSwgc3F1YXJlOiB0cnVlLFxuICAgICAgICBiYXI6IHRydWUsIHRleHQ6IHRydWVcbiAgICAgIH07XG4gICAgY2FzZSBTSEFQRTpcbiAgICAgIHJldHVybiB7cG9pbnQ6IHRydWV9O1xuICAgIGNhc2UgVEVYVDpcbiAgICAgIHJldHVybiB7dGV4dDogdHJ1ZX07XG4gICAgY2FzZSBQQVRIOlxuICAgICAgcmV0dXJuIHtsaW5lOiB0cnVlfTtcbiAgfVxuICByZXR1cm4ge307XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3VwcG9ydGVkUm9sZSB7XG4gIG1lYXN1cmU6IGJvb2xlYW47XG4gIGRpbWVuc2lvbjogYm9vbGVhbjtcbn07XG5cbi8qKlxuICogUmV0dXJuIHdoZXRoZXIgYSBjaGFubmVsIHN1cHBvcnRzIGRpbWVuc2lvbiAvIG1lYXN1cmUgcm9sZVxuICogQHBhcmFtICBjaGFubmVsXG4gKiBAcmV0dXJuIEEgZGljdGlvbmFyeSBtYXBwaW5nIHJvbGUgdG8gYm9vbGVhbiB2YWx1ZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTdXBwb3J0ZWRSb2xlKGNoYW5uZWw6IENoYW5uZWwpOiBTdXBwb3J0ZWRSb2xlIHtcbiAgc3dpdGNoIChjaGFubmVsKSB7XG4gICAgY2FzZSBYOlxuICAgIGNhc2UgWTpcbiAgICBjYXNlIENPTE9SOlxuICAgIGNhc2UgT1BBQ0lUWTpcbiAgICBjYXNlIExBQkVMOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbWVhc3VyZTogdHJ1ZSxcbiAgICAgICAgZGltZW5zaW9uOiB0cnVlXG4gICAgICB9O1xuICAgIGNhc2UgUk9XOlxuICAgIGNhc2UgQ09MVU1OOlxuICAgIGNhc2UgU0hBUEU6XG4gICAgY2FzZSBERVRBSUw6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBtZWFzdXJlOiBmYWxzZSxcbiAgICAgICAgZGltZW5zaW9uOiB0cnVlXG4gICAgICB9O1xuICAgIGNhc2UgWDI6XG4gICAgY2FzZSBZMjpcbiAgICBjYXNlIFNJWkU6XG4gICAgY2FzZSBURVhUOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbWVhc3VyZTogdHJ1ZSxcbiAgICAgICAgZGltZW5zaW9uOiBmYWxzZVxuICAgICAgfTtcbiAgICBjYXNlIFBBVEg6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBtZWFzdXJlOiBmYWxzZSxcbiAgICAgICAgZGltZW5zaW9uOiB0cnVlXG4gICAgICB9O1xuICB9XG4gIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBlbmNvZGluZyBjaGFubmVsJyArIGNoYW5uZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzU2NhbGUoY2hhbm5lbDogQ2hhbm5lbCkge1xuICByZXR1cm4gIWNvbnRhaW5zKFtERVRBSUwsIFBBVEgsIFRFWFQsIExBQkVMLCBPUkRFUl0sIGNoYW5uZWwpO1xufVxuIiwiaW1wb3J0IHtBeGlzT3JpZW50fSBmcm9tICcuLi9heGlzJztcbmltcG9ydCB7Q09MVU1OLCBST1csIFgsIFksIFgyLCBZMiwgQ2hhbm5lbH0gZnJvbSAnLi4vY2hhbm5lbCc7XG5pbXBvcnQge3RpdGxlIGFzIGZpZWxkRGVmVGl0bGUsIGlzRGltZW5zaW9ufSBmcm9tICcuLi9maWVsZGRlZic7XG5pbXBvcnQge05PTUlOQUwsIE9SRElOQUwsIFRFTVBPUkFMfSBmcm9tICcuLi90eXBlJztcbmltcG9ydCB7Y29udGFpbnMsIGtleXMsIGV4dGVuZCwgdHJ1bmNhdGUsIERpY3R9IGZyb20gJy4uL3V0aWwnO1xuaW1wb3J0IHtWZ0F4aXN9IGZyb20gJy4uL3ZlZ2Euc2NoZW1hJztcblxuaW1wb3J0IHtmb3JtYXRNaXhpbnN9IGZyb20gJy4vY29tbW9uJztcbmltcG9ydCB7TW9kZWx9IGZyb20gJy4vbW9kZWwnO1xuaW1wb3J0IHtVbml0TW9kZWx9IGZyb20gJy4vdW5pdCc7XG5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9ibG9iL21hc3Rlci9kb2Mvc3BlYy5tZCMxMS1hbWJpZW50LWRlY2xhcmF0aW9uc1xuZGVjbGFyZSBsZXQgZXhwb3J0cztcblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQXhpc0NvbXBvbmVudChtb2RlbDogTW9kZWwsIGF4aXNDaGFubmVsczogQ2hhbm5lbFtdKTogRGljdDxWZ0F4aXM+IHtcbiAgcmV0dXJuIGF4aXNDaGFubmVscy5yZWR1Y2UoZnVuY3Rpb24oYXhpcywgY2hhbm5lbCkge1xuICAgIGlmIChtb2RlbC5heGlzKGNoYW5uZWwpKSB7XG4gICAgICBheGlzW2NoYW5uZWxdID0gcGFyc2VBeGlzKGNoYW5uZWwsIG1vZGVsKTtcbiAgICB9XG4gICAgcmV0dXJuIGF4aXM7XG4gIH0sIHt9IGFzIERpY3Q8VmdBeGlzPik7XG59XG5cbi8qKlxuICogTWFrZSBhbiBpbm5lciBheGlzIGZvciBzaG93aW5nIGdyaWQgZm9yIHNoYXJlZCBheGlzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VJbm5lckF4aXMoY2hhbm5lbDogQ2hhbm5lbCwgbW9kZWw6IE1vZGVsKTogVmdBeGlzIHtcbiAgY29uc3QgaXNDb2wgPSBjaGFubmVsID09PSBDT0xVTU4sXG4gICAgaXNSb3cgPSBjaGFubmVsID09PSBST1csXG4gICAgdHlwZSA9IGlzQ29sID8gJ3gnIDogaXNSb3cgPyAneSc6IGNoYW5uZWw7XG5cbiAgLy8gVE9ETzogc3VwcG9ydCBhZGRpbmcgdGlja3MgYXMgd2VsbFxuXG4gIC8vIFRPRE86IHJlcGxhY2UgYW55IHdpdGggVmVnYSBBeGlzIEludGVyZmFjZVxuICBsZXQgZGVmOiBhbnkgPSB7XG4gICAgdHlwZTogdHlwZSxcbiAgICBzY2FsZTogbW9kZWwuc2NhbGVOYW1lKGNoYW5uZWwpLFxuICAgIGdyaWQ6IHRydWUsXG4gICAgdGlja1NpemU6IDAsXG4gICAgcHJvcGVydGllczoge1xuICAgICAgbGFiZWxzOiB7XG4gICAgICAgIHRleHQ6IHt2YWx1ZTogJyd9XG4gICAgICB9LFxuICAgICAgYXhpczoge1xuICAgICAgICBzdHJva2U6IHt2YWx1ZTogJ3RyYW5zcGFyZW50J31cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgY29uc3QgYXhpcyA9IG1vZGVsLmF4aXMoY2hhbm5lbCk7XG5cbiAgWydsYXllcicsICd0aWNrcycsICd2YWx1ZXMnLCAnc3ViZGl2aWRlJ10uZm9yRWFjaChmdW5jdGlvbihwcm9wZXJ0eSkge1xuICAgIGxldCBtZXRob2Q6IChtb2RlbDogTW9kZWwsIGNoYW5uZWw6IENoYW5uZWwsIGRlZjphbnkpPT5hbnk7XG5cbiAgICBjb25zdCB2YWx1ZSA9IChtZXRob2QgPSBleHBvcnRzW3Byb3BlcnR5XSkgP1xuICAgICAgICAgICAgICAgICAgLy8gY2FsbGluZyBheGlzLmZvcm1hdCwgYXhpcy5ncmlkLCAuLi5cbiAgICAgICAgICAgICAgICAgIG1ldGhvZChtb2RlbCwgY2hhbm5lbCwgZGVmKSA6XG4gICAgICAgICAgICAgICAgICBheGlzW3Byb3BlcnR5XTtcbiAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgZGVmW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgIH1cbiAgfSk7XG5cbiAgY29uc3QgcHJvcHMgPSBtb2RlbC5heGlzKGNoYW5uZWwpLnByb3BlcnRpZXMgfHwge307XG5cbiAgLy8gRm9yIG5vdywgb25seSBuZWVkIHRvIGFkZCBncmlkIHByb3BlcnRpZXMgaGVyZSBiZWNhdXNlIGlubmVyQXhpcyBpcyBvbmx5IGZvciByZW5kZXJpbmcgZ3JpZC5cbiAgLy8gVE9ETzogc3VwcG9ydCBhZGQgb3RoZXIgcHJvcGVydGllcyBmb3IgaW5uZXJBeGlzXG4gIFsnZ3JpZCddLmZvckVhY2goZnVuY3Rpb24oZ3JvdXApIHtcbiAgICBjb25zdCB2YWx1ZSA9IHByb3BlcnRpZXNbZ3JvdXBdID9cbiAgICAgIHByb3BlcnRpZXNbZ3JvdXBdKG1vZGVsLCBjaGFubmVsLCBwcm9wc1tncm91cF0gfHwge30sIGRlZikgOlxuICAgICAgcHJvcHNbZ3JvdXBdO1xuICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIGtleXModmFsdWUpLmxlbmd0aCA+IDApIHtcbiAgICAgIGRlZi5wcm9wZXJ0aWVzID0gZGVmLnByb3BlcnRpZXMgfHwge307XG4gICAgICBkZWYucHJvcGVydGllc1tncm91cF0gPSB2YWx1ZTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBkZWY7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUF4aXMoY2hhbm5lbDogQ2hhbm5lbCwgbW9kZWw6IE1vZGVsKTogVmdBeGlzIHtcbiAgY29uc3QgaXNDb2wgPSBjaGFubmVsID09PSBDT0xVTU4sXG4gICAgaXNSb3cgPSBjaGFubmVsID09PSBST1csXG4gICAgdHlwZSA9IGlzQ29sID8gJ3gnIDogaXNSb3cgPyAneSc6IGNoYW5uZWw7XG5cbiAgY29uc3QgYXhpcyA9IG1vZGVsLmF4aXMoY2hhbm5lbCk7XG5cbiAgLy8gVE9ETzogcmVwbGFjZSBhbnkgd2l0aCBWZWdhIEF4aXMgSW50ZXJmYWNlXG4gIGxldCBkZWY6IGFueSA9IHtcbiAgICB0eXBlOiB0eXBlLFxuICAgIHNjYWxlOiBtb2RlbC5zY2FsZU5hbWUoY2hhbm5lbClcbiAgfTtcblxuICAvLyBmb3JtYXQgbWl4aW5zIChhZGQgZm9ybWF0IGFuZCBmb3JtYXRUeXBlKVxuICAvLyBJbiBjYXNlIHdlIG5lZWQgdG8gZ2V0IHRoZSBmaWVsZGRlZiBheGlzIGZvciBYMiBvciBZMlxuICAvLyBpZiBYIG9yIFkgZG9lc24ndCBleGlzdCBpbiB0aGUgbW9kZWwuIFVzZSB0YXJnZXRDaGFubmVsXG4gIC8vIHRvIGFjY2VzcyBYMiBvciBZMi5cbiAgbGV0IHRhcmdldENoYW5uZWwgPSBjaGFubmVsO1xuICBpZiAoIW1vZGVsLmhhcyhjaGFubmVsKSkge1xuICAgIHRhcmdldENoYW5uZWwgPSBjaGFubmVsID09PSBYID8gWDIgOiBZMjtcbiAgfVxuICBleHRlbmQoZGVmLCBmb3JtYXRNaXhpbnMobW9kZWwsIG1vZGVsLmZpZWxkRGVmKHRhcmdldENoYW5uZWwpLCBheGlzLmZvcm1hdCwgYXhpcy5zaG9ydFRpbWVMYWJlbHMpKTtcbiAgLy8gMS4yLiBBZGQgcHJvcGVydGllc1xuICBbXG4gICAgLy8gYSkgcHJvcGVydGllcyB3aXRoIHNwZWNpYWwgcnVsZXMgKHNvIGl0IGhhcyBheGlzW3Byb3BlcnR5XSBtZXRob2RzKSAtLSBjYWxsIHJ1bGUgZnVuY3Rpb25zXG4gICAgJ2dyaWQnLCAnbGF5ZXInLCAnb2Zmc2V0JywgJ29yaWVudCcsICd0aWNrU2l6ZScsICd0aWNrcycsICd0aWNrU2l6ZUVuZCcsICd0aXRsZScsICd0aXRsZU9mZnNldCcsXG4gICAgLy8gYikgcHJvcGVydGllcyB3aXRob3V0IHJ1bGVzLCBvbmx5IHByb2R1Y2UgZGVmYXVsdCB2YWx1ZXMgaW4gdGhlIHNjaGVtYSwgb3IgZXhwbGljaXQgdmFsdWUgaWYgc3BlY2lmaWVkXG4gICAgJ3RpY2tQYWRkaW5nJywgJ3RpY2tTaXplJywgJ3RpY2tTaXplTWFqb3InLCAndGlja1NpemVNaW5vcicsICd2YWx1ZXMnLCAnc3ViZGl2aWRlJ1xuICBdLmZvckVhY2goZnVuY3Rpb24ocHJvcGVydHkpIHtcbiAgICBsZXQgbWV0aG9kOiAobW9kZWw6IE1vZGVsLCBjaGFubmVsOiBDaGFubmVsLCBkZWY6YW55KT0+YW55O1xuXG4gICAgY29uc3QgdmFsdWUgPSAobWV0aG9kID0gZXhwb3J0c1twcm9wZXJ0eV0pID9cbiAgICAgICAgICAgICAgICAgIC8vIGNhbGxpbmcgYXhpcy5mb3JtYXQsIGF4aXMuZ3JpZCwgLi4uXG4gICAgICAgICAgICAgICAgICBtZXRob2QobW9kZWwsIGNoYW5uZWwsIGRlZikgOlxuICAgICAgICAgICAgICAgICAgYXhpc1twcm9wZXJ0eV07XG4gICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGRlZltwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIDIpIEFkZCBtYXJrIHByb3BlcnR5IGRlZmluaXRpb24gZ3JvdXBzXG4gIGNvbnN0IHByb3BzID0gbW9kZWwuYXhpcyhjaGFubmVsKS5wcm9wZXJ0aWVzIHx8IHt9O1xuXG4gIFtcbiAgICAnYXhpcycsICdsYWJlbHMnLCAvLyBoYXZlIHNwZWNpYWwgcnVsZXNcbiAgICAnZ3JpZCcsICd0aXRsZScsICd0aWNrcycsICdtYWpvclRpY2tzJywgJ21pbm9yVGlja3MnIC8vIG9ubHkgZGVmYXVsdCB2YWx1ZXNcbiAgXS5mb3JFYWNoKGZ1bmN0aW9uKGdyb3VwKSB7XG4gICAgY29uc3QgdmFsdWUgPSBwcm9wZXJ0aWVzW2dyb3VwXSA/XG4gICAgICBwcm9wZXJ0aWVzW2dyb3VwXShtb2RlbCwgY2hhbm5lbCwgcHJvcHNbZ3JvdXBdIHx8IHt9LCBkZWYpIDpcbiAgICAgIHByb3BzW2dyb3VwXTtcbiAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCAmJiBrZXlzKHZhbHVlKS5sZW5ndGggPiAwKSB7XG4gICAgICBkZWYucHJvcGVydGllcyA9IGRlZi5wcm9wZXJ0aWVzIHx8IHt9O1xuICAgICAgZGVmLnByb3BlcnRpZXNbZ3JvdXBdID0gdmFsdWU7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gZGVmO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb2Zmc2V0KG1vZGVsOiBNb2RlbCwgY2hhbm5lbDogQ2hhbm5lbCkge1xuICByZXR1cm4gbW9kZWwuYXhpcyhjaGFubmVsKS5vZmZzZXQ7XG59XG5cbi8vIFRPRE86IHdlIG5lZWQgdG8gcmVmYWN0b3IgdGhpcyBtZXRob2QgYWZ0ZXIgd2UgdGFrZSBjYXJlIG9mIGNvbmZpZyByZWZhY3RvcmluZ1xuLyoqXG4gKiBEZWZhdWx0IHJ1bGVzIGZvciB3aGV0aGVyIHRvIHNob3cgYSBncmlkIHNob3VsZCBiZSBzaG93biBmb3IgYSBjaGFubmVsLlxuICogSWYgYGdyaWRgIGlzIHVuc3BlY2lmaWVkLCB0aGUgZGVmYXVsdCB2YWx1ZSBpcyBgdHJ1ZWAgZm9yIG9yZGluYWwgc2NhbGVzIHRoYXQgYXJlIG5vdCBiaW5uZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdyaWRTaG93KG1vZGVsOiBNb2RlbCwgY2hhbm5lbDogQ2hhbm5lbCkge1xuICBjb25zdCBncmlkID0gbW9kZWwuYXhpcyhjaGFubmVsKS5ncmlkO1xuICBpZiAoZ3JpZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGdyaWQ7XG4gIH1cblxuICByZXR1cm4gIW1vZGVsLmlzT3JkaW5hbFNjYWxlKGNoYW5uZWwpICYmICFtb2RlbC5maWVsZERlZihjaGFubmVsKS5iaW47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBncmlkKG1vZGVsOiBNb2RlbCwgY2hhbm5lbDogQ2hhbm5lbCkge1xuICBpZiAoY2hhbm5lbCA9PT0gUk9XIHx8IGNoYW5uZWwgPT09IENPTFVNTikge1xuICAgIC8vIG5ldmVyIGFwcGx5IGdyaWQgZm9yIFJPVyBhbmQgQ09MVU1OIHNpbmNlIHdlIG1hbnVhbGx5IGNyZWF0ZSBydWxlLWdyb3VwIGZvciB0aGVtXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIHJldHVybiBncmlkU2hvdyhtb2RlbCwgY2hhbm5lbCkgJiYgKFxuICAgIC8vIFRPRE8gcmVmYWN0b3IgdGhpcyBjbGVhbmx5IC0tIGVzc2VudGlhbGx5IHRoZSBjb25kaXRpb24gYmVsb3cgaXMgd2hldGhlclxuICAgIC8vIHRoZSBheGlzIGlzIGEgc2hhcmVkIC8gdW5pb24gYXhpcy5cbiAgICAoY2hhbm5lbCA9PT0gWSB8fCBjaGFubmVsID09PSBYKSAmJiAhKG1vZGVsLnBhcmVudCgpICYmIG1vZGVsLnBhcmVudCgpLmlzRmFjZXQoKSlcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxheWVyKG1vZGVsOiBNb2RlbCwgY2hhbm5lbDogQ2hhbm5lbCwgZGVmKSB7XG4gIGNvbnN0IGxheWVyID0gbW9kZWwuYXhpcyhjaGFubmVsKS5sYXllcjtcbiAgaWYgKGxheWVyICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gbGF5ZXI7XG4gIH1cbiAgaWYgKGRlZi5ncmlkKSB7XG4gICAgLy8gaWYgZ3JpZCBpcyB0cnVlLCBuZWVkIHRvIHB1dCBsYXllciBvbiB0aGUgYmFjayBzbyB0aGF0IGdyaWQgaXMgYmVoaW5kIG1hcmtzXG4gICAgcmV0dXJuICdiYWNrJztcbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkOyAvLyBvdGhlcndpc2UgcmV0dXJuIHVuZGVmaW5lZCBhbmQgdXNlIFZlZ2EncyBkZWZhdWx0LlxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIG9yaWVudChtb2RlbDogTW9kZWwsIGNoYW5uZWw6IENoYW5uZWwpIHtcbiAgY29uc3Qgb3JpZW50ID0gbW9kZWwuYXhpcyhjaGFubmVsKS5vcmllbnQ7XG4gIGlmIChvcmllbnQpIHtcbiAgICByZXR1cm4gb3JpZW50O1xuICB9IGVsc2UgaWYgKGNoYW5uZWwgPT09IENPTFVNTikge1xuICAgIC8vIEZJWE1FIHRlc3QgYW5kIGRlY2lkZVxuICAgIHJldHVybiBBeGlzT3JpZW50LlRPUDtcbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdGlja3MobW9kZWw6IE1vZGVsLCBjaGFubmVsOiBDaGFubmVsKSB7XG4gIGNvbnN0IHRpY2tzID0gbW9kZWwuYXhpcyhjaGFubmVsKS50aWNrcztcbiAgaWYgKHRpY2tzICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gdGlja3M7XG4gIH1cblxuICAvLyBGSVhNRSBkZXBlbmRzIG9uIHNjYWxlIHR5cGUgdG9vXG4gIGlmIChjaGFubmVsID09PSBYICYmICFtb2RlbC5maWVsZERlZihjaGFubmVsKS5iaW4pIHtcbiAgICAvLyBWZWdhJ3MgZGVmYXVsdCB0aWNrcyBvZnRlbiBsZWFkIHRvIGEgbG90IG9mIGxhYmVsIG9jY2x1c2lvbiBvbiBYIHdpdGhvdXQgOTAgZGVncmVlIHJvdGF0aW9uXG4gICAgcmV0dXJuIDU7XG4gIH1cblxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdGlja1NpemUobW9kZWw6IE1vZGVsLCBjaGFubmVsOiBDaGFubmVsKSB7XG4gIGNvbnN0IHRpY2tTaXplID0gbW9kZWwuYXhpcyhjaGFubmVsKS50aWNrU2l6ZTtcbiAgaWYgKHRpY2tTaXplICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gdGlja1NpemU7XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRpY2tTaXplRW5kKG1vZGVsOiBNb2RlbCwgY2hhbm5lbDogQ2hhbm5lbCkge1xuICBjb25zdCB0aWNrU2l6ZUVuZCA9IG1vZGVsLmF4aXMoY2hhbm5lbCkudGlja1NpemVFbmQ7XG4gIGlmICh0aWNrU2l6ZUVuZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGlja1NpemVFbmQ7XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gdGl0bGUobW9kZWw6IE1vZGVsLCBjaGFubmVsOiBDaGFubmVsKSB7XG4gIGNvbnN0IGF4aXMgPSBtb2RlbC5heGlzKGNoYW5uZWwpO1xuICBpZiAoYXhpcy50aXRsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGF4aXMudGl0bGU7XG4gIH1cblxuICAvLyBpZiBub3QgZGVmaW5lZCwgYXV0b21hdGljYWxseSBkZXRlcm1pbmUgYXhpcyB0aXRsZSBmcm9tIGZpZWxkIGRlZlxuICBjb25zdCBmaWVsZFRpdGxlID0gZmllbGREZWZUaXRsZShtb2RlbC5maWVsZERlZihjaGFubmVsKSk7XG5cbiAgbGV0IG1heExlbmd0aDtcbiAgaWYgKGF4aXMudGl0bGVNYXhMZW5ndGgpIHtcbiAgICBtYXhMZW5ndGggPSBheGlzLnRpdGxlTWF4TGVuZ3RoO1xuICB9IGVsc2UgaWYgKGNoYW5uZWwgPT09IFggJiYgIW1vZGVsLmlzT3JkaW5hbFNjYWxlKFgpKSB7XG4gICAgY29uc3QgdW5pdE1vZGVsOiBVbml0TW9kZWwgPSBtb2RlbCBhcyBhbnk7IC8vIG9ubHkgdW5pdCBtb2RlbCBoYXMgY2hhbm5lbCB4XG4gICAgLy8gRm9yIG5vbi1vcmRpbmFsIHNjYWxlLCB3ZSBrbm93IGNlbGwgc2l6ZSBhdCBjb21waWxlIHRpbWUsIHdlIGNhbiBndWVzcyBtYXggbGVuZ3RoXG4gICAgbWF4TGVuZ3RoID0gdW5pdE1vZGVsLmNvbmZpZygpLmNlbGwud2lkdGggLyBtb2RlbC5heGlzKFgpLmNoYXJhY3RlcldpZHRoO1xuICB9IGVsc2UgaWYgKGNoYW5uZWwgPT09IFkgJiYgIW1vZGVsLmlzT3JkaW5hbFNjYWxlKFkpKSB7XG4gICAgY29uc3QgdW5pdE1vZGVsOiBVbml0TW9kZWwgPSBtb2RlbCBhcyBhbnk7IC8vIG9ubHkgdW5pdCBtb2RlbCBoYXMgY2hhbm5lbCB5XG4gICAgLy8gRm9yIG5vbi1vcmRpbmFsIHNjYWxlLCB3ZSBrbm93IGNlbGwgc2l6ZSBhdCBjb21waWxlIHRpbWUsIHdlIGNhbiBndWVzcyBtYXggbGVuZ3RoXG4gICAgbWF4TGVuZ3RoID0gdW5pdE1vZGVsLmNvbmZpZygpLmNlbGwuaGVpZ2h0IC8gbW9kZWwuYXhpcyhZKS5jaGFyYWN0ZXJXaWR0aDtcbiAgfVxuXG4gIC8vIEZJWE1FOiB3ZSBzaG91bGQgdXNlIHRlbXBsYXRlIHRvIHRydW5jYXRlIGluc3RlYWRcbiAgcmV0dXJuIG1heExlbmd0aCA/IHRydW5jYXRlKGZpZWxkVGl0bGUsIG1heExlbmd0aCkgOiBmaWVsZFRpdGxlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdGl0bGVPZmZzZXQobW9kZWw6IE1vZGVsLCBjaGFubmVsOiBDaGFubmVsKSB7XG4gIGNvbnN0IHRpdGxlT2Zmc2V0ID0gbW9kZWwuYXhpcyhjaGFubmVsKS50aXRsZU9mZnNldDtcbiAgaWYgKHRpdGxlT2Zmc2V0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aXRsZU9mZnNldDtcbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgbmFtZXNwYWNlIHByb3BlcnRpZXMge1xuICBleHBvcnQgZnVuY3Rpb24gYXhpcyhtb2RlbDogTW9kZWwsIGNoYW5uZWw6IENoYW5uZWwsIGF4aXNQcm9wc1NwZWMpIHtcbiAgICBjb25zdCBheGlzID0gbW9kZWwuYXhpcyhjaGFubmVsKTtcblxuICAgIHJldHVybiBleHRlbmQoXG4gICAgICBheGlzLmF4aXNDb2xvciAhPT0gdW5kZWZpbmVkID9cbiAgICAgICAgeyBzdHJva2U6IHt2YWx1ZTogYXhpcy5heGlzQ29sb3J9IH0gOlxuICAgICAgICB7fSxcbiAgICAgIGF4aXMuYXhpc1dpZHRoICE9PSB1bmRlZmluZWQgP1xuICAgICAgICB7IHN0cm9rZVdpZHRoOiB7dmFsdWU6IGF4aXMuYXhpc1dpZHRofSB9IDpcbiAgICAgICAge30sXG4gICAgICBheGlzUHJvcHNTcGVjIHx8IHt9XG4gICAgKTtcbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiBncmlkKG1vZGVsOiBNb2RlbCwgY2hhbm5lbDogQ2hhbm5lbCwgZ3JpZFByb3BzU3BlYykge1xuICAgIGNvbnN0IGF4aXMgPSBtb2RlbC5heGlzKGNoYW5uZWwpO1xuXG4gICAgcmV0dXJuIGV4dGVuZChcbiAgICAgIGF4aXMuZ3JpZENvbG9yICE9PSB1bmRlZmluZWQgPyB7IHN0cm9rZToge3ZhbHVlOiBheGlzLmdyaWRDb2xvcn19IDoge30sXG4gICAgICBheGlzLmdyaWRPcGFjaXR5ICE9PSB1bmRlZmluZWQgPyB7c3Ryb2tlT3BhY2l0eToge3ZhbHVlOiBheGlzLmdyaWRPcGFjaXR5fSB9IDoge30sXG4gICAgICBheGlzLmdyaWRXaWR0aCAhPT0gdW5kZWZpbmVkID8ge3N0cm9rZVdpZHRoIDoge3ZhbHVlOiBheGlzLmdyaWRXaWR0aH0gfSA6IHt9LFxuICAgICAgYXhpcy5ncmlkRGFzaCAhPT0gdW5kZWZpbmVkID8ge3N0cm9rZURhc2hPZmZzZXQgOiB7dmFsdWU6IGF4aXMuZ3JpZERhc2h9IH0gOiB7fSxcbiAgICAgIGdyaWRQcm9wc1NwZWMgfHwge31cbiAgICApO1xuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIGxhYmVscyhtb2RlbDogTW9kZWwsIGNoYW5uZWw6IENoYW5uZWwsIGxhYmVsc1NwZWMsIGRlZikge1xuICAgIGNvbnN0IGZpZWxkRGVmID0gbW9kZWwuZmllbGREZWYoY2hhbm5lbCk7XG4gICAgY29uc3QgYXhpcyA9IG1vZGVsLmF4aXMoY2hhbm5lbCk7XG5cbiAgICBpZiAoIWF4aXMubGFiZWxzKSB7XG4gICAgICByZXR1cm4gZXh0ZW5kKHtcbiAgICAgICAgdGV4dDogJydcbiAgICAgIH0sIGxhYmVsc1NwZWMpO1xuICAgIH1cblxuICAgIGlmIChjb250YWlucyhbTk9NSU5BTCwgT1JESU5BTF0sIGZpZWxkRGVmLnR5cGUpICYmIGF4aXMubGFiZWxNYXhMZW5ndGgpIHtcbiAgICAgIC8vIFRPRE8gcmVwbGFjZSB0aGlzIHdpdGggVmVnYSdzIGxhYmVsTWF4TGVuZ3RoIG9uY2UgaXQgaXMgaW50cm9kdWNlZFxuICAgICAgbGFiZWxzU3BlYyA9IGV4dGVuZCh7XG4gICAgICAgIHRleHQ6IHtcbiAgICAgICAgICB0ZW1wbGF0ZTogJ3t7IGRhdHVtLmRhdGEgfCB0cnVuY2F0ZTonICsgYXhpcy5sYWJlbE1heExlbmd0aCArICd9fSdcbiAgICAgICAgfVxuICAgICAgfSwgbGFiZWxzU3BlYyB8fCB7fSk7XG4gICAgfVxuXG4gICAgLy8gTGFiZWwgQW5nbGVcbiAgICBpZiAoYXhpcy5sYWJlbEFuZ2xlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGxhYmVsc1NwZWMuYW5nbGUgPSB7dmFsdWU6IGF4aXMubGFiZWxBbmdsZX07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGF1dG8gcm90YXRlIGZvciBYIGFuZCBSb3dcbiAgICAgIGlmIChjaGFubmVsID09PSBYICYmIChpc0RpbWVuc2lvbihmaWVsZERlZikgfHwgZmllbGREZWYudHlwZSA9PT0gVEVNUE9SQUwpKSB7XG4gICAgICAgIGxhYmVsc1NwZWMuYW5nbGUgPSB7dmFsdWU6IDI3MH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGF4aXMubGFiZWxBbGlnbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBsYWJlbHNTcGVjLmFsaWduID0ge3ZhbHVlOiBheGlzLmxhYmVsQWxpZ259O1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBBdXRvIHNldCBhbGlnbiBpZiByb3RhdGVkXG4gICAgICAvLyBUT0RPOiBjb25zaWRlciBvdGhlciB2YWx1ZSBiZXNpZGVzIDI3MCwgOTBcbiAgICAgIGlmIChsYWJlbHNTcGVjLmFuZ2xlKSB7XG4gICAgICAgIGlmIChsYWJlbHNTcGVjLmFuZ2xlLnZhbHVlID09PSAyNzApIHtcbiAgICAgICAgICBsYWJlbHNTcGVjLmFsaWduID0ge1xuICAgICAgICAgICAgdmFsdWU6IGRlZi5vcmllbnQgPT09ICd0b3AnID8gJ2xlZnQnOlxuICAgICAgICAgICAgICAgICAgIGRlZi50eXBlID09PSAneCcgPyAncmlnaHQnIDpcbiAgICAgICAgICAgICAgICAgICAnY2VudGVyJ1xuICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSBpZiAobGFiZWxzU3BlYy5hbmdsZS52YWx1ZSA9PT0gOTApIHtcbiAgICAgICAgICBsYWJlbHNTcGVjLmFsaWduID0ge3ZhbHVlOiAnY2VudGVyJ307XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoYXhpcy5sYWJlbEJhc2VsaW5lICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGxhYmVsc1NwZWMuYmFzZWxpbmUgPSB7dmFsdWU6IGF4aXMubGFiZWxCYXNlbGluZX07XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChsYWJlbHNTcGVjLmFuZ2xlKSB7XG4gICAgICAgIC8vIEF1dG8gc2V0IGJhc2VsaW5lIGlmIHJvdGF0ZWRcbiAgICAgICAgLy8gVE9ETzogY29uc2lkZXIgb3RoZXIgdmFsdWUgYmVzaWRlcyAyNzAsIDkwXG4gICAgICAgIGlmIChsYWJlbHNTcGVjLmFuZ2xlLnZhbHVlID09PSAyNzApIHtcbiAgICAgICAgICBsYWJlbHNTcGVjLmJhc2VsaW5lID0ge3ZhbHVlOiBkZWYudHlwZSA9PT0gJ3gnID8gJ21pZGRsZScgOiAnYm90dG9tJ307XG4gICAgICAgIH0gZWxzZSBpZiAobGFiZWxzU3BlYy5hbmdsZS52YWx1ZSA9PT0gOTApIHtcbiAgICAgICAgICBsYWJlbHNTcGVjLmJhc2VsaW5lID0ge3ZhbHVlOiAnYm90dG9tJ307XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoYXhpcy50aWNrTGFiZWxDb2xvciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxhYmVsc1NwZWMuc3Ryb2tlID0ge3ZhbHVlOiBheGlzLnRpY2tMYWJlbENvbG9yfTtcbiAgICB9XG5cbiAgICBpZiAoYXhpcy50aWNrTGFiZWxGb250ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGFiZWxzU3BlYy5mb250ID0ge3ZhbHVlOiBheGlzLnRpY2tMYWJlbEZvbnR9O1xuICAgIH1cblxuICAgIGlmIChheGlzLnRpY2tMYWJlbEZvbnRTaXplICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGFiZWxzU3BlYy5mb250U2l6ZSA9IHt2YWx1ZTogYXhpcy50aWNrTGFiZWxGb250U2l6ZX07XG4gICAgfVxuXG4gICAgcmV0dXJuIGtleXMobGFiZWxzU3BlYykubGVuZ3RoID09PSAwID8gdW5kZWZpbmVkIDogbGFiZWxzU3BlYztcbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiB0aWNrcyhtb2RlbDogTW9kZWwsIGNoYW5uZWw6IENoYW5uZWwsIHRpY2tzUHJvcHNTcGVjKSB7XG4gICAgY29uc3QgYXhpcyA9IG1vZGVsLmF4aXMoY2hhbm5lbCk7XG5cbiAgICByZXR1cm4gZXh0ZW5kKFxuICAgICAgYXhpcy50aWNrQ29sb3IgIT09IHVuZGVmaW5lZCA/IHtzdHJva2UgOiB7dmFsdWU6IGF4aXMudGlja0NvbG9yfSB9IDoge30sXG4gICAgICBheGlzLnRpY2tXaWR0aCAhPT0gdW5kZWZpbmVkID8ge3N0cm9rZVdpZHRoOiB7dmFsdWU6IGF4aXMudGlja1dpZHRofSB9IDoge30sXG4gICAgICB0aWNrc1Byb3BzU3BlYyB8fCB7fVxuICAgICk7XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gdGl0bGUobW9kZWw6IE1vZGVsLCBjaGFubmVsOiBDaGFubmVsLCB0aXRsZVByb3BzU3BlYykge1xuICAgIGNvbnN0IGF4aXMgPSBtb2RlbC5heGlzKGNoYW5uZWwpO1xuXG4gICAgcmV0dXJuIGV4dGVuZChcbiAgICAgIGF4aXMudGl0bGVDb2xvciAhPT0gdW5kZWZpbmVkID8ge3N0cm9rZSA6IHt2YWx1ZTogYXhpcy50aXRsZUNvbG9yfSB9IDoge30sXG4gICAgICBheGlzLnRpdGxlRm9udCAhPT0gdW5kZWZpbmVkID8ge2ZvbnQ6IHt2YWx1ZTogYXhpcy50aXRsZUZvbnR9fSA6IHt9LFxuICAgICAgYXhpcy50aXRsZUZvbnRTaXplICE9PSB1bmRlZmluZWQgPyB7Zm9udFNpemU6IHt2YWx1ZTogYXhpcy50aXRsZUZvbnRTaXplfX0gOiB7fSxcbiAgICAgIGF4aXMudGl0bGVGb250V2VpZ2h0ICE9PSB1bmRlZmluZWQgPyB7Zm9udFdlaWdodDoge3ZhbHVlOiBheGlzLnRpdGxlRm9udFdlaWdodH19IDoge30sXG5cbiAgICAgIHRpdGxlUHJvcHNTcGVjIHx8IHt9XG4gICAgKTtcbiAgfVxufVxuIiwiaW1wb3J0IHtDT0xPUiwgT1BBQ0lUWX0gZnJvbSAnLi4vY2hhbm5lbCc7XG5pbXBvcnQge0ZpZWxkRGVmLCBmaWVsZCwgT3JkZXJDaGFubmVsRGVmfSBmcm9tICcuLi9maWVsZGRlZic7XG5pbXBvcnQge1NvcnRPcmRlcn0gZnJvbSAnLi4vc29ydCc7XG5pbXBvcnQge1FVQU5USVRBVElWRSwgT1JESU5BTCwgVEVNUE9SQUx9IGZyb20gJy4uL3R5cGUnO1xuaW1wb3J0IHtjb250YWlucywgdW5pb259IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQge0ZhY2V0TW9kZWx9IGZyb20gJy4vZmFjZXQnO1xuaW1wb3J0IHtMYXllck1vZGVsfSBmcm9tICcuL2xheWVyJztcbmltcG9ydCB7TW9kZWx9IGZyb20gJy4vbW9kZWwnO1xuaW1wb3J0IHtmb3JtYXQgYXMgdGltZUZvcm1hdH0gZnJvbSAnLi4vdGltZXVuaXQnO1xuaW1wb3J0IHtVbml0TW9kZWx9IGZyb20gJy4vdW5pdCc7XG5pbXBvcnQge1NwZWMsIGlzVW5pdFNwZWMsIGlzRmFjZXRTcGVjLCBpc0xheWVyU3BlY30gZnJvbSAnLi4vc3BlYyc7XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkTW9kZWwoc3BlYzogU3BlYywgcGFyZW50OiBNb2RlbCwgcGFyZW50R2l2ZW5OYW1lOiBzdHJpbmcpOiBNb2RlbCB7XG4gIGlmIChpc0ZhY2V0U3BlYyhzcGVjKSkge1xuICAgIHJldHVybiBuZXcgRmFjZXRNb2RlbChzcGVjLCBwYXJlbnQsIHBhcmVudEdpdmVuTmFtZSk7XG4gIH1cblxuICBpZiAoaXNMYXllclNwZWMoc3BlYykpIHtcbiAgICByZXR1cm4gbmV3IExheWVyTW9kZWwoc3BlYywgcGFyZW50LCBwYXJlbnRHaXZlbk5hbWUpO1xuICB9XG5cbiAgaWYgKGlzVW5pdFNwZWMoc3BlYykpIHtcbiAgICByZXR1cm4gbmV3IFVuaXRNb2RlbChzcGVjLCBwYXJlbnQsIHBhcmVudEdpdmVuTmFtZSk7XG4gIH1cblxuICBjb25zb2xlLmVycm9yKCdJbnZhbGlkIHNwZWMuJyk7XG4gIHJldHVybiBudWxsO1xufVxuXG4vLyBUT0RPOiBmaWd1cmUgaWYgd2UgcmVhbGx5IG5lZWQgb3BhY2l0eSBpbiBib3RoXG5leHBvcnQgY29uc3QgU1RST0tFX0NPTkZJRyA9IFsnc3Ryb2tlJywgJ3N0cm9rZVdpZHRoJyxcbiAgJ3N0cm9rZURhc2gnLCAnc3Ryb2tlRGFzaE9mZnNldCcsICdzdHJva2VPcGFjaXR5JywgJ29wYWNpdHknXTtcblxuZXhwb3J0IGNvbnN0IEZJTExfQ09ORklHID0gWydmaWxsJywgJ2ZpbGxPcGFjaXR5JyxcbiAgJ29wYWNpdHknXTtcblxuZXhwb3J0IGNvbnN0IEZJTExfU1RST0tFX0NPTkZJRyA9IHVuaW9uKFNUUk9LRV9DT05GSUcsIEZJTExfQ09ORklHKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5Q29sb3JBbmRPcGFjaXR5KHAsIG1vZGVsOiBVbml0TW9kZWwpIHtcbiAgY29uc3QgZmlsbGVkID0gbW9kZWwuY29uZmlnKCkubWFyay5maWxsZWQ7XG4gIGNvbnN0IGNvbG9yRmllbGREZWYgPSBtb2RlbC5maWVsZERlZihDT0xPUik7XG4gIGNvbnN0IG9wYWNpdHlGaWVsZERlZiA9IG1vZGVsLmZpZWxkRGVmKE9QQUNJVFkpO1xuXG4gIC8vIEFwcGx5IGZpbGwgc3Ryb2tlIGNvbmZpZyBmaXJzdCBzbyB0aGF0IGNvbG9yIGZpZWxkIC8gdmFsdWUgY2FuIG92ZXJyaWRlXG4gIC8vIGZpbGwgLyBzdHJva2VcbiAgaWYgKGZpbGxlZCkge1xuICAgIGFwcGx5TWFya0NvbmZpZyhwLCBtb2RlbCwgRklMTF9DT05GSUcpO1xuICB9IGVsc2Uge1xuICAgIGFwcGx5TWFya0NvbmZpZyhwLCBtb2RlbCwgU1RST0tFX0NPTkZJRyk7XG4gIH1cblxuICBsZXQgY29sb3JWYWx1ZTtcbiAgbGV0IG9wYWNpdHlWYWx1ZTtcbiAgaWYgKG1vZGVsLmhhcyhDT0xPUikpIHtcbiAgICBjb2xvclZhbHVlID0ge1xuICAgICAgc2NhbGU6IG1vZGVsLnNjYWxlTmFtZShDT0xPUiksXG4gICAgICBmaWVsZDogbW9kZWwuZmllbGQoQ09MT1IsIGNvbG9yRmllbGREZWYudHlwZSA9PT0gT1JESU5BTCA/IHtwcmVmbjogJ3JhbmtfJ30gOiB7fSlcbiAgICB9O1xuICB9IGVsc2UgaWYgKGNvbG9yRmllbGREZWYgJiYgY29sb3JGaWVsZERlZi52YWx1ZSkge1xuICAgIGNvbG9yVmFsdWUgPSB7IHZhbHVlOiBjb2xvckZpZWxkRGVmLnZhbHVlIH07XG4gIH1cblxuICBpZiAobW9kZWwuaGFzKE9QQUNJVFkpKSB7XG4gICAgb3BhY2l0eVZhbHVlID0ge1xuICAgICAgc2NhbGU6IG1vZGVsLnNjYWxlTmFtZShPUEFDSVRZKSxcbiAgICAgIGZpZWxkOiBtb2RlbC5maWVsZChPUEFDSVRZLCBvcGFjaXR5RmllbGREZWYudHlwZSA9PT0gT1JESU5BTCA/IHtwcmVmbjogJ3JhbmtfJ30gOiB7fSlcbiAgICB9O1xuICB9IGVsc2UgaWYgKG9wYWNpdHlGaWVsZERlZiAmJiBvcGFjaXR5RmllbGREZWYudmFsdWUpIHtcbiAgICBvcGFjaXR5VmFsdWUgPSB7IHZhbHVlOiBvcGFjaXR5RmllbGREZWYudmFsdWUgfTtcbiAgfVxuXG4gIGlmIChjb2xvclZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZiAoZmlsbGVkKSB7XG4gICAgICBwLmZpbGwgPSBjb2xvclZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBwLnN0cm9rZSA9IGNvbG9yVmFsdWU7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIGFwcGx5IGNvbG9yIGNvbmZpZyBpZiB0aGVyZSBpcyBubyBmaWxsIC8gc3Ryb2tlIGNvbmZpZ1xuICAgIHBbZmlsbGVkID8gJ2ZpbGwnIDogJ3N0cm9rZSddID0gcFtmaWxsZWQgPyAnZmlsbCcgOiAnc3Ryb2tlJ10gfHxcbiAgICAgIHt2YWx1ZTogbW9kZWwuY29uZmlnKCkubWFyay5jb2xvcn07XG4gIH1cblxuICBpZiAob3BhY2l0eVZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICBwLm9wYWNpdHkgPSBvcGFjaXR5VmFsdWU7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5Q29uZmlnKHByb3BlcnRpZXMsIGNvbmZpZywgcHJvcHNMaXN0OiBzdHJpbmdbXSkge1xuICBwcm9wc0xpc3QuZm9yRWFjaChmdW5jdGlvbihwcm9wZXJ0eSkge1xuICAgIGNvbnN0IHZhbHVlID0gY29uZmlnW3Byb3BlcnR5XTtcbiAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcHJvcGVydGllc1twcm9wZXJ0eV0gPSB7IHZhbHVlOiB2YWx1ZSB9O1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBwcm9wZXJ0aWVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlNYXJrQ29uZmlnKG1hcmtzUHJvcGVydGllcywgbW9kZWw6IFVuaXRNb2RlbCwgcHJvcHNMaXN0OiBzdHJpbmdbXSkge1xuICByZXR1cm4gYXBwbHlDb25maWcobWFya3NQcm9wZXJ0aWVzLCBtb2RlbC5jb25maWcoKS5tYXJrLCBwcm9wc0xpc3QpO1xufVxuXG5cbi8qKlxuICogQnVpbGRzIGFuIG9iamVjdCB3aXRoIGZvcm1hdCBhbmQgZm9ybWF0VHlwZSBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwYXJhbSBmb3JtYXQgZXhwbGljaXRseSBzcGVjaWZpZWQgZm9ybWF0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRNaXhpbnMobW9kZWw6IE1vZGVsLCBmaWVsZERlZjogRmllbGREZWYsIGZvcm1hdDogc3RyaW5nLCBzaG9ydFRpbWVMYWJlbHM6IGJvb2xlYW4pIHtcbiAgaWYoIWNvbnRhaW5zKFtRVUFOVElUQVRJVkUsIFRFTVBPUkFMXSwgZmllbGREZWYudHlwZSkpIHtcbiAgICByZXR1cm4ge307XG4gIH1cblxuICBsZXQgZGVmOiBhbnkgPSB7fTtcblxuICBpZiAoZmllbGREZWYudHlwZSA9PT0gVEVNUE9SQUwpIHtcbiAgICBkZWYuZm9ybWF0VHlwZSA9ICd0aW1lJztcbiAgfVxuXG4gIGlmIChmb3JtYXQgIT09IHVuZGVmaW5lZCkge1xuICAgIGRlZi5mb3JtYXQgPSBmb3JtYXQ7XG4gIH0gZWxzZSB7XG4gICAgc3dpdGNoIChmaWVsZERlZi50eXBlKSB7XG4gICAgICBjYXNlIFFVQU5USVRBVElWRTpcbiAgICAgICAgZGVmLmZvcm1hdCA9IG1vZGVsLmNvbmZpZygpLm51bWJlckZvcm1hdDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRFTVBPUkFMOlxuICAgICAgICBkZWYuZm9ybWF0ID0gdGltZUZvcm1hdChmaWVsZERlZi50aW1lVW5pdCwgc2hvcnRUaW1lTGFiZWxzKSB8fCBtb2RlbC5jb25maWcoKS50aW1lRm9ybWF0O1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlZjtcbn1cblxuLyoqIFJldHVybiBmaWVsZCByZWZlcmVuY2Ugd2l0aCBwb3RlbnRpYWwgXCItXCIgcHJlZml4IGZvciBkZXNjZW5kaW5nIHNvcnQgKi9cbmV4cG9ydCBmdW5jdGlvbiBzb3J0RmllbGQob3JkZXJDaGFubmVsRGVmOiBPcmRlckNoYW5uZWxEZWYpIHtcbiAgcmV0dXJuIChvcmRlckNoYW5uZWxEZWYuc29ydCA9PT0gU29ydE9yZGVyLkRFU0NFTkRJTkcgPyAnLScgOiAnJykgKyBmaWVsZChvcmRlckNoYW5uZWxEZWYpO1xufVxuIiwiLyoqXG4gKiBNb2R1bGUgZm9yIGNvbXBpbGluZyBWZWdhLWxpdGUgc3BlYyBpbnRvIFZlZ2Egc3BlYy5cbiAqL1xuXG5pbXBvcnQge0xBWU9VVH0gZnJvbSAnLi4vZGF0YSc7XG5pbXBvcnQge01vZGVsfSBmcm9tICcuL21vZGVsJztcbmltcG9ydCB7bm9ybWFsaXplLCBFeHRlbmRlZFNwZWN9IGZyb20gJy4uL3NwZWMnO1xuaW1wb3J0IHtleHRlbmR9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQge2J1aWxkTW9kZWx9IGZyb20gJy4vY29tbW9uJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGUoaW5wdXRTcGVjOiBFeHRlbmRlZFNwZWMpIHtcbiAgLy8gMS4gQ29udmVydCBpbnB1dCBzcGVjIGludG8gYSBub3JtYWwgZm9ybVxuICAvLyAoRGVjb21wb3NlIGFsbCBleHRlbmRlZCB1bml0IHNwZWNzIGludG8gY29tcG9zaXRpb24gb2YgdW5pdCBzcGVjLilcbiAgY29uc3Qgc3BlYyA9IG5vcm1hbGl6ZShpbnB1dFNwZWMpO1xuXG4gIC8vIDIuIEluc3RhbnRpYXRlIHRoZSBtb2RlbCB3aXRoIGRlZmF1bHQgcHJvcGVydGllc1xuICBjb25zdCBtb2RlbCA9IGJ1aWxkTW9kZWwoc3BlYywgbnVsbCwgJycpO1xuXG4gIC8vIDMuIFBhcnNlIGVhY2ggcGFydCBvZiB0aGUgbW9kZWwgdG8gcHJvZHVjZSBjb21wb25lbnRzIHRoYXQgd2lsbCBiZSBhc3NlbWJsZWQgbGF0ZXJcbiAgLy8gV2UgdHJhdmVyc2UgdGhlIHdob2xlIHRyZWUgdG8gcGFyc2Ugb25jZSBmb3IgZWFjaCB0eXBlIG9mIGNvbXBvbmVudHNcbiAgLy8gKGUuZy4sIGRhdGEsIGxheW91dCwgbWFyaywgc2NhbGUpLlxuICAvLyBQbGVhc2Ugc2VlIGluc2lkZSBtb2RlbC5wYXJzZSgpIGZvciBvcmRlciBmb3IgY29tcGlsYXRpb24uXG4gIG1vZGVsLnBhcnNlKCk7XG5cbiAgLy8gNC4gQXNzZW1ibGUgYSBWZWdhIFNwZWMgZnJvbSB0aGUgcGFyc2VkIGNvbXBvbmVudHMgaW4gMy5cbiAgcmV0dXJuIGFzc2VtYmxlKG1vZGVsKTtcbn1cblxuZnVuY3Rpb24gYXNzZW1ibGUobW9kZWw6IE1vZGVsKSB7XG4gIGNvbnN0IGNvbmZpZyA9IG1vZGVsLmNvbmZpZygpO1xuXG4gIC8vIFRPRE86IGNoYW5nZSB0eXBlIHRvIGJlY29tZSBWZ1NwZWNcbiAgY29uc3Qgb3V0cHV0ID0gZXh0ZW5kKFxuICAgIHtcbiAgICAgIC8vIFNldCBzaXplIHRvIDEgYmVjYXVzZSB3ZSByZWx5IG9uIHBhZGRpbmcgYW55d2F5XG4gICAgICB3aWR0aDogMSxcbiAgICAgIGhlaWdodDogMSxcbiAgICAgIHBhZGRpbmc6ICdhdXRvJ1xuICAgIH0sXG4gICAgY29uZmlnLnZpZXdwb3J0ID8geyB2aWV3cG9ydDogY29uZmlnLnZpZXdwb3J0IH0gOiB7fSxcbiAgICBjb25maWcuYmFja2dyb3VuZCA/IHsgYmFja2dyb3VuZDogY29uZmlnLmJhY2tncm91bmQgfSA6IHt9LFxuICAgIHtcbiAgICAgIC8vIFRPRE86IHNpZ25hbDogbW9kZWwuYXNzZW1ibGVTZWxlY3Rpb25TaWduYWxcbiAgICAgIGRhdGE6IFtdLmNvbmNhdChcbiAgICAgICAgbW9kZWwuYXNzZW1ibGVEYXRhKFtdKSxcbiAgICAgICAgbW9kZWwuYXNzZW1ibGVMYXlvdXQoW10pXG4gICAgICAgIC8vIFRPRE86IG1vZGVsLmFzc2VtYmxlU2VsZWN0aW9uRGF0YVxuICAgICAgKSxcbiAgICAgIG1hcmtzOiBbYXNzZW1ibGVSb290R3JvdXAobW9kZWwpXVxuICAgIH0pO1xuXG4gIHJldHVybiB7XG4gICAgc3BlYzogb3V0cHV0XG4gICAgLy8gVE9ETzogYWRkIHdhcm5pbmcgLyBlcnJvcnMgaGVyZVxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXNzZW1ibGVSb290R3JvdXAobW9kZWw6IE1vZGVsKSB7XG4gIGxldCByb290R3JvdXA6YW55ID0gZXh0ZW5kKHtcbiAgICAgIG5hbWU6IG1vZGVsLm5hbWUoJ3Jvb3QnKSxcbiAgICAgIHR5cGU6ICdncm91cCcsXG4gICAgfSxcbiAgICBtb2RlbC5kZXNjcmlwdGlvbigpID8ge2Rlc2NyaXB0aW9uOiBtb2RlbC5kZXNjcmlwdGlvbigpfSA6IHt9LFxuICAgIHtcbiAgICAgIGZyb206IHtkYXRhOiBMQVlPVVR9LFxuICAgICAgcHJvcGVydGllczoge1xuICAgICAgICB1cGRhdGU6IGV4dGVuZChcbiAgICAgICAgICB7XG4gICAgICAgICAgICB3aWR0aDoge2ZpZWxkOiAnd2lkdGgnfSxcbiAgICAgICAgICAgIGhlaWdodDoge2ZpZWxkOiAnaGVpZ2h0J31cbiAgICAgICAgICB9LFxuICAgICAgICAgIG1vZGVsLmFzc2VtYmxlUGFyZW50R3JvdXBQcm9wZXJ0aWVzKG1vZGVsLmNvbmZpZygpLmNlbGwpXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9KTtcblxuICByZXR1cm4gZXh0ZW5kKHJvb3RHcm91cCwgbW9kZWwuYXNzZW1ibGVHcm91cCgpKTtcbn1cbiIsImltcG9ydCB7WCwgREVUQUlMfSBmcm9tICcuLi9jaGFubmVsJztcbmltcG9ydCB7Q29uZmlnfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHtFbmNvZGluZ30gZnJvbSAnLi4vZW5jb2RpbmcnO1xuaW1wb3J0IHtpc0FnZ3JlZ2F0ZSwgaGFzfSBmcm9tICcuLi9lbmNvZGluZyc7XG5pbXBvcnQge2lzTWVhc3VyZX0gZnJvbSAnLi4vZmllbGRkZWYnO1xuaW1wb3J0IHtQT0lOVCwgTElORSwgVElDSywgQ0lSQ0xFLCBTUVVBUkUsIFJVTEUsIE1hcmt9IGZyb20gJy4uL21hcmsnO1xuaW1wb3J0IHtjb250YWlucywgZXh0ZW5kfSBmcm9tICcuLi91dGlsJztcblxuLyoqXG4gKiBBdWdtZW50IGNvbmZpZy5tYXJrIHdpdGggcnVsZS1iYXNlZCBkZWZhdWx0IHZhbHVlcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluaXRNYXJrQ29uZmlnKG1hcms6IE1hcmssIGVuY29kaW5nOiBFbmNvZGluZywgY29uZmlnOiBDb25maWcpIHtcbiAgIHJldHVybiBleHRlbmQoXG4gICAgIFsnZmlsbGVkJywgJ29wYWNpdHknLCAnb3JpZW50JywgJ2FsaWduJ10ucmVkdWNlKGZ1bmN0aW9uKGNmZywgcHJvcGVydHk6IHN0cmluZykge1xuICAgICAgIGNvbnN0IHZhbHVlID0gY29uZmlnLm1hcmtbcHJvcGVydHldO1xuICAgICAgIHN3aXRjaCAocHJvcGVydHkpIHtcbiAgICAgICAgIGNhc2UgJ2ZpbGxlZCc6XG4gICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgLy8gUG9pbnQsIGxpbmUsIGFuZCBydWxlIGFyZSBub3QgZmlsbGVkIGJ5IGRlZmF1bHRcbiAgICAgICAgICAgICBjZmdbcHJvcGVydHldID0gbWFyayAhPT0gUE9JTlQgJiYgbWFyayAhPT0gTElORSAmJiBtYXJrICE9PSBSVUxFO1xuICAgICAgICAgICB9XG4gICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgY2FzZSAnb3BhY2l0eSc6XG4gICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkICYmIGNvbnRhaW5zKFtQT0lOVCwgVElDSywgQ0lSQ0xFLCBTUVVBUkVdLCBtYXJrKSkge1xuICAgICAgICAgICAgIC8vIHBvaW50LWJhc2VkIG1hcmtzIGFuZCBiYXJcbiAgICAgICAgICAgICBpZiAoIWlzQWdncmVnYXRlKGVuY29kaW5nKSB8fCBoYXMoZW5jb2RpbmcsIERFVEFJTCkpIHtcbiAgICAgICAgICAgICAgIGNmZ1twcm9wZXJ0eV0gPSAwLjc7XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9XG4gICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgY2FzZSAnb3JpZW50JzpcbiAgICAgICAgICAgY29uc3QgeElzTWVhc3VyZSA9IGlzTWVhc3VyZShlbmNvZGluZy54KSB8fCBpc01lYXN1cmUoZW5jb2RpbmcueDIpO1xuICAgICAgICAgICBjb25zdCB5SXNNZWFzdXJlID0gaXNNZWFzdXJlKGVuY29kaW5nLnkpIHx8IGlzTWVhc3VyZShlbmNvZGluZy55Mik7XG5cbiAgICAgICAgICAgLy8gV2hlbiB1bmFtYmlndW91cywgZG8gbm90IGFsbG93IG92ZXJyaWRpbmdcbiAgICAgICAgICAgaWYgKHhJc01lYXN1cmUgJiYgIXlJc01lYXN1cmUpIHtcbiAgICAgICAgICAgICBpZiAobWFyayA9PT0gVElDSykge1xuICAgICAgICAgICAgICAgY2ZnW3Byb3BlcnR5XSA9ICd2ZXJ0aWNhbCc7XG4gICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgIGNmZ1twcm9wZXJ0eV0gPSAnaG9yaXpvbnRhbCc7ICAvLyBpbXBsaWNpdGx5IHZlcnRpY2FsXG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9IGVsc2UgaWYgKCF4SXNNZWFzdXJlICYmIHlJc01lYXN1cmUpIHtcbiAgICAgICAgICAgICBpZiAobWFyayA9PT0gVElDSykge1xuICAgICAgICAgICAgICAgY2ZnW3Byb3BlcnR5XSA9ICdob3Jpem9udGFsJztcbiAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgY2ZnW3Byb3BlcnR5XSA9ICd2ZXJ0aWNhbCc7ICAvLyBpbXBsaWNpdGx5IGhvcml6b250YWxcbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH1cblxuICAgICAgICAgICAvLyBJbiBhbWJpZ3VvdXMgY2FzZXMgKFF4USBvciBPeE8pIHVzZSBzcGVjaWZpZWQgdmFsdWVcbiAgICAgICAgICAgLy8gKGFuZCBpbXBsaWNpdGx5IHZlcnRpY2FsIGJ5IGRlZmF1bHQuKVxuICAgICAgICAgICBicmVhaztcbiAgICAgICAgIC8vIHRleHQtb25seVxuICAgICAgICAgY2FzZSAnYWxpZ24nOlxuICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjZmdbcHJvcGVydHldID0gaGFzKGVuY29kaW5nLCBYKSA/ICdjZW50ZXInIDogJ3JpZ2h0JztcbiAgICAgICAgICB9XG4gICAgICAgfVxuICAgICAgIHJldHVybiBjZmc7XG4gICAgIH0sIHt9KSxcbiAgICAgY29uZmlnLm1hcmtcbiAgICk7XG59XG4iLCJpbXBvcnQge2F1dG9NYXhCaW5zfSBmcm9tICcuLi8uLi9iaW4nO1xuaW1wb3J0IHtDaGFubmVsLCBDT0xPUn0gZnJvbSAnLi4vLi4vY2hhbm5lbCc7XG5pbXBvcnQge2ZpZWxkLCBGaWVsZERlZn0gZnJvbSAnLi4vLi4vZmllbGRkZWYnO1xuaW1wb3J0IHtleHRlbmQsIHZhbHMsIGZsYXR0ZW4sIGhhc2gsIERpY3R9IGZyb20gJy4uLy4uL3V0aWwnO1xuaW1wb3J0IHtWZ1RyYW5zZm9ybX0gZnJvbSAnLi4vLi4vdmVnYS5zY2hlbWEnO1xuXG5pbXBvcnQge0ZhY2V0TW9kZWx9IGZyb20gJy4vLi4vZmFjZXQnO1xuaW1wb3J0IHtMYXllck1vZGVsfSBmcm9tICcuLy4uL2xheWVyJztcbmltcG9ydCB7TW9kZWx9IGZyb20gJy4vLi4vbW9kZWwnO1xuXG5pbXBvcnQge0RhdGFDb21wb25lbnR9IGZyb20gJy4vZGF0YSc7XG5cbmV4cG9ydCBuYW1lc3BhY2UgYmluIHtcbiAgZnVuY3Rpb24gcGFyc2UobW9kZWw6IE1vZGVsKTogRGljdDxWZ1RyYW5zZm9ybVtdPiB7XG4gICAgcmV0dXJuIG1vZGVsLnJlZHVjZShmdW5jdGlvbihiaW5Db21wb25lbnQsIGZpZWxkRGVmOiBGaWVsZERlZiwgY2hhbm5lbDogQ2hhbm5lbCkge1xuICAgICAgY29uc3QgYmluID0gbW9kZWwuZmllbGREZWYoY2hhbm5lbCkuYmluO1xuICAgICAgaWYgKGJpbikge1xuICAgICAgICBsZXQgYmluVHJhbnMgPSBleHRlbmQoe1xuICAgICAgICAgIHR5cGU6ICdiaW4nLFxuICAgICAgICAgIGZpZWxkOiBmaWVsZERlZi5maWVsZCxcbiAgICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICAgIHN0YXJ0OiBmaWVsZChmaWVsZERlZiwgeyBiaW5TdWZmaXg6ICdfc3RhcnQnIH0pLFxuICAgICAgICAgICAgbWlkOiBmaWVsZChmaWVsZERlZiwgeyBiaW5TdWZmaXg6ICdfbWlkJyB9KSxcbiAgICAgICAgICAgIGVuZDogZmllbGQoZmllbGREZWYsIHsgYmluU3VmZml4OiAnX2VuZCcgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgICAgLy8gaWYgYmluIGlzIGFuIG9iamVjdCwgbG9hZCBwYXJhbWV0ZXIgaGVyZSFcbiAgICAgICAgICB0eXBlb2YgYmluID09PSAnYm9vbGVhbicgPyB7fSA6IGJpblxuICAgICAgICApO1xuXG4gICAgICAgIGlmICghYmluVHJhbnMubWF4YmlucyAmJiAhYmluVHJhbnMuc3RlcCkge1xuICAgICAgICAgIC8vIGlmIGJvdGggbWF4YmlucyBhbmQgc3RlcCBhcmUgbm90IHNwZWNpZmllZCwgbmVlZCB0byBhdXRvbWF0aWNhbGx5IGRldGVybWluZSBiaW5cbiAgICAgICAgICBiaW5UcmFucy5tYXhiaW5zID0gYXV0b01heEJpbnMoY2hhbm5lbCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0cmFuc2Zvcm0gPSBbYmluVHJhbnNdO1xuICAgICAgICBjb25zdCBpc09yZGluYWxDb2xvciA9IG1vZGVsLmlzT3JkaW5hbFNjYWxlKGNoYW5uZWwpIHx8IGNoYW5uZWwgPT09IENPTE9SO1xuICAgICAgICAvLyBjb2xvciByYW1wIGhhcyB0eXBlIGxpbmVhciBvciB0aW1lXG4gICAgICAgIGlmIChpc09yZGluYWxDb2xvcikge1xuICAgICAgICAgIHRyYW5zZm9ybS5wdXNoKHtcbiAgICAgICAgICAgIHR5cGU6ICdmb3JtdWxhJyxcbiAgICAgICAgICAgIGZpZWxkOiBmaWVsZChmaWVsZERlZiwgeyBiaW5TdWZmaXg6ICdfcmFuZ2UnIH0pLFxuICAgICAgICAgICAgZXhwcjogZmllbGQoZmllbGREZWYsIHsgZGF0dW06IHRydWUsIGJpblN1ZmZpeDogJ19zdGFydCcgfSkgK1xuICAgICAgICAgICAgJyArIFxcJy1cXCcgKyAnICtcbiAgICAgICAgICAgIGZpZWxkKGZpZWxkRGVmLCB7IGRhdHVtOiB0cnVlLCBiaW5TdWZmaXg6ICdfZW5kJyB9KVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIEZJWE1FOiBjdXJyZW50IG1lcmdpbmcgbG9naWMgY2FuIHByb2R1Y2UgcmVkdW5kYW50IHRyYW5zZm9ybXMgd2hlbiBhIGZpZWxkIGlzIGJpbm5lZCBmb3IgY29sb3IgYW5kIGZvciBub24tY29sb3JcbiAgICAgICAgY29uc3Qga2V5ID0gaGFzaChiaW4pICsgJ18nICsgZmllbGREZWYuZmllbGQgKyAnb2M6JyArIGlzT3JkaW5hbENvbG9yO1xuICAgICAgICBiaW5Db21wb25lbnRba2V5XSA9IHRyYW5zZm9ybTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBiaW5Db21wb25lbnQ7XG4gICAgfSwge30pO1xuICB9XG5cbiAgZXhwb3J0IGNvbnN0IHBhcnNlVW5pdCA9IHBhcnNlO1xuXG4gIGV4cG9ydCBmdW5jdGlvbiBwYXJzZUZhY2V0KG1vZGVsOiBGYWNldE1vZGVsKSB7XG4gICAgbGV0IGJpbkNvbXBvbmVudCA9IHBhcnNlKG1vZGVsKTtcblxuICAgIGNvbnN0IGNoaWxkRGF0YUNvbXBvbmVudCA9IG1vZGVsLmNoaWxkKCkuY29tcG9uZW50LmRhdGE7XG5cbiAgICAvLyBJZiBjaGlsZCBkb2Vzbid0IGhhdmUgaXRzIG93biBkYXRhIHNvdXJjZSwgdGhlbiBtZXJnZVxuICAgIGlmICghY2hpbGREYXRhQ29tcG9uZW50LnNvdXJjZSkge1xuICAgICAgLy8gRklYTUU6IGN1cnJlbnQgbWVyZ2luZyBsb2dpYyBjYW4gcHJvZHVjZSByZWR1bmRhbnQgdHJhbnNmb3JtcyB3aGVuIGEgZmllbGQgaXMgYmlubmVkIGZvciBjb2xvciBhbmQgZm9yIG5vbi1jb2xvclxuICAgICAgZXh0ZW5kKGJpbkNvbXBvbmVudCwgY2hpbGREYXRhQ29tcG9uZW50LmJpbik7XG4gICAgICBkZWxldGUgY2hpbGREYXRhQ29tcG9uZW50LmJpbjtcbiAgICB9XG4gICAgcmV0dXJuIGJpbkNvbXBvbmVudDtcbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiBwYXJzZUxheWVyKG1vZGVsOiBMYXllck1vZGVsKSB7XG4gICAgbGV0IGJpbkNvbXBvbmVudCA9IHBhcnNlKG1vZGVsKTtcblxuICAgIG1vZGVsLmNoaWxkcmVuKCkuZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgIGNvbnN0IGNoaWxkRGF0YUNvbXBvbmVudCA9IGNoaWxkLmNvbXBvbmVudC5kYXRhO1xuXG4gICAgICAvLyBJZiBjaGlsZCBkb2Vzbid0IGhhdmUgaXRzIG93biBkYXRhIHNvdXJjZSwgdGhlbiBtZXJnZVxuICAgICAgaWYgKCFjaGlsZERhdGFDb21wb25lbnQuc291cmNlKSB7XG4gICAgICAgIGV4dGVuZChiaW5Db21wb25lbnQsIGNoaWxkRGF0YUNvbXBvbmVudC5iaW4pO1xuICAgICAgICBkZWxldGUgY2hpbGREYXRhQ29tcG9uZW50LmJpbjtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBiaW5Db21wb25lbnQ7XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gYXNzZW1ibGUoY29tcG9uZW50OiBEYXRhQ29tcG9uZW50KSB7XG4gICAgcmV0dXJuIGZsYXR0ZW4odmFscyhjb21wb25lbnQuYmluKSk7XG4gIH1cbn1cbiIsImltcG9ydCB7Q09MT1J9IGZyb20gJy4uLy4uL2NoYW5uZWwnO1xuaW1wb3J0IHtPUkRJTkFMfSBmcm9tICcuLi8uLi90eXBlJztcbmltcG9ydCB7ZXh0ZW5kLCB2YWxzLCBmbGF0dGVuLCBEaWN0fSBmcm9tICcuLi8uLi91dGlsJztcbmltcG9ydCB7VmdUcmFuc2Zvcm19IGZyb20gJy4uLy4uL3ZlZ2Euc2NoZW1hJztcblxuaW1wb3J0IHtGYWNldE1vZGVsfSBmcm9tICcuLy4uL2ZhY2V0JztcbmltcG9ydCB7TGF5ZXJNb2RlbH0gZnJvbSAnLi8uLi9sYXllcic7XG5pbXBvcnQge01vZGVsfSBmcm9tICcuLy4uL21vZGVsJztcblxuaW1wb3J0IHtEYXRhQ29tcG9uZW50fSBmcm9tICcuL2RhdGEnO1xuXG5cbi8qKlxuICogV2UgbmVlZCB0byBhZGQgYSByYW5rIHRyYW5zZm9ybSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlIHJhbmsgdmFsdWUgYXNcbiAqIGlucHV0IGZvciBjb2xvciByYW1wJ3MgbGluZWFyIHNjYWxlLlxuICovXG5leHBvcnQgbmFtZXNwYWNlIGNvbG9yUmFuayB7XG4gIC8qKlxuICAgKiBSZXR1cm4gaGFzaCBkaWN0IGZyb20gYSBjb2xvciBmaWVsZCdzIG5hbWUgdG8gdGhlIHNvcnQgYW5kIHJhbmsgdHJhbnNmb3Jtc1xuICAgKi9cbiAgZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVW5pdChtb2RlbDogTW9kZWwpIHtcbiAgICBsZXQgY29sb3JSYW5rQ29tcG9uZW50OiBEaWN0PFZnVHJhbnNmb3JtW10+ID0ge307XG4gICAgaWYgKG1vZGVsLmhhcyhDT0xPUikgJiYgbW9kZWwuZmllbGREZWYoQ09MT1IpLnR5cGUgPT09IE9SRElOQUwpIHtcbiAgICAgIGNvbG9yUmFua0NvbXBvbmVudFttb2RlbC5maWVsZChDT0xPUildID0gW3tcbiAgICAgICAgdHlwZTogJ3NvcnQnLFxuICAgICAgICBieTogbW9kZWwuZmllbGQoQ09MT1IpXG4gICAgICB9LCB7XG4gICAgICAgIHR5cGU6ICdyYW5rJyxcbiAgICAgICAgZmllbGQ6IG1vZGVsLmZpZWxkKENPTE9SKSxcbiAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgcmFuazogbW9kZWwuZmllbGQoQ09MT1IsIHsgcHJlZm46ICdyYW5rXycgfSlcbiAgICAgICAgfVxuICAgICAgfV07XG4gICAgfVxuICAgIHJldHVybiBjb2xvclJhbmtDb21wb25lbnQ7XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gcGFyc2VGYWNldChtb2RlbDogRmFjZXRNb2RlbCkge1xuICAgIGNvbnN0IGNoaWxkRGF0YUNvbXBvbmVudCA9IG1vZGVsLmNoaWxkKCkuY29tcG9uZW50LmRhdGE7XG5cbiAgICAvLyBJZiBjaGlsZCBkb2Vzbid0IGhhdmUgaXRzIG93biBkYXRhIHNvdXJjZSwgdGhlbiBjb25zaWRlciBtZXJnaW5nXG4gICAgaWYgKCFjaGlsZERhdGFDb21wb25lbnQuc291cmNlKSB7XG4gICAgICAvLyBUT0RPOiB3ZSBoYXZlIHRvIHNlZSBpZiBjb2xvciBoYXMgdW5pb24gc2NhbGUgaGVyZVxuXG4gICAgICAvLyBGb3Igbm93LCBsZXQncyBhc3N1bWUgaXQgYWx3YXlzIGhhcyB1bmlvbiBzY2FsZVxuICAgICAgY29uc3QgY29sb3JSYW5rQ29tcG9uZW50ID0gY2hpbGREYXRhQ29tcG9uZW50LmNvbG9yUmFuaztcbiAgICAgIGRlbGV0ZSBjaGlsZERhdGFDb21wb25lbnQuY29sb3JSYW5rO1xuICAgICAgcmV0dXJuIGNvbG9yUmFua0NvbXBvbmVudDtcbiAgICB9XG4gICAgcmV0dXJuIHt9IGFzIERpY3Q8VmdUcmFuc2Zvcm1bXT47XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gcGFyc2VMYXllcihtb2RlbDogTGF5ZXJNb2RlbCkge1xuICAgIGxldCBjb2xvclJhbmtDb21wb25lbnQgPSB7fSBhcyBEaWN0PFZnVHJhbnNmb3JtW10+O1xuXG4gICAgbW9kZWwuY2hpbGRyZW4oKS5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgICAgY29uc3QgY2hpbGREYXRhQ29tcG9uZW50ID0gY2hpbGQuY29tcG9uZW50LmRhdGE7XG5cbiAgICAgIC8vIElmIGNoaWxkIGRvZXNuJ3QgaGF2ZSBpdHMgb3duIGRhdGEgc291cmNlLCB0aGVuIG1lcmdlXG4gICAgICBpZiAoIWNoaWxkRGF0YUNvbXBvbmVudC5zb3VyY2UpIHtcbiAgICAgICAgZXh0ZW5kKGNvbG9yUmFua0NvbXBvbmVudCwgY2hpbGREYXRhQ29tcG9uZW50LmNvbG9yUmFuayk7XG4gICAgICAgIGRlbGV0ZSBjaGlsZERhdGFDb21wb25lbnQuY29sb3JSYW5rO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNvbG9yUmFua0NvbXBvbmVudDtcbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiBhc3NlbWJsZShjb21wb25lbnQ6IERhdGFDb21wb25lbnQpIHtcbiAgICByZXR1cm4gZmxhdHRlbih2YWxzKGNvbXBvbmVudC5jb2xvclJhbmspKTtcbiAgfVxufVxuIiwiaW1wb3J0IHtGb3JtdWxhfSBmcm9tICcuLi8uLi90cmFuc2Zvcm0nO1xuaW1wb3J0IHtrZXlzLCBEaWN0LCBTdHJpbmdTZXR9IGZyb20gJy4uLy4uL3V0aWwnO1xuaW1wb3J0IHtWZ0RhdGEsIFZnVHJhbnNmb3JtfSBmcm9tICcuLi8uLi92ZWdhLnNjaGVtYSc7XG5cbmltcG9ydCB7RmFjZXRNb2RlbH0gZnJvbSAnLi8uLi9mYWNldCc7XG5pbXBvcnQge0xheWVyTW9kZWx9IGZyb20gJy4vLi4vbGF5ZXInO1xuaW1wb3J0IHtNb2RlbH0gZnJvbSAnLi8uLi9tb2RlbCc7XG5pbXBvcnQge1VuaXRNb2RlbH0gZnJvbSAnLi8uLi91bml0JztcblxuaW1wb3J0IHtzb3VyY2V9IGZyb20gJy4vc291cmNlJztcbmltcG9ydCB7Zm9ybWF0UGFyc2V9IGZyb20gJy4vZm9ybWF0cGFyc2UnO1xuaW1wb3J0IHtudWxsRmlsdGVyfSBmcm9tICcuL251bGxmaWx0ZXInO1xuaW1wb3J0IHtmaWx0ZXJ9IGZyb20gJy4vZmlsdGVyJztcbmltcG9ydCB7YmlufSBmcm9tICcuL2Jpbic7XG5pbXBvcnQge2Zvcm11bGF9IGZyb20gJy4vZm9ybXVsYSc7XG5pbXBvcnQge25vblBvc2l0aXZlRmlsdGVyfSBmcm9tICcuL25vbnBvc2l0aXZlbnVsbGZpbHRlcic7XG5pbXBvcnQge3N1bW1hcnl9IGZyb20gJy4vc3VtbWFyeSc7XG5pbXBvcnQge3N0YWNrU2NhbGV9IGZyb20gJy4vc3RhY2tzY2FsZSc7XG5pbXBvcnQge3RpbWVVbml0fSBmcm9tICcuL3RpbWV1bml0JztcbmltcG9ydCB7dGltZVVuaXREb21haW59IGZyb20gJy4vdGltZXVuaXRkb21haW4nO1xuaW1wb3J0IHtjb2xvclJhbmt9IGZyb20gJy4vY29sb3JyYW5rJztcblxuXG4vKipcbiAqIENvbXBvc2FibGUgY29tcG9uZW50IGluc3RhbmNlIG9mIGEgbW9kZWwncyBkYXRhLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIERhdGFDb21wb25lbnQge1xuICBzb3VyY2U6IFZnRGF0YTtcblxuICAvKiogTWFwcGluZyBmcm9tIGZpZWxkIG5hbWUgdG8gcHJpbWl0aXZlIGRhdGEgdHlwZS4gICovXG4gIGZvcm1hdFBhcnNlOiBEaWN0PHN0cmluZz47XG5cbiAgLyoqIFN0cmluZyBzZXQgb2YgZmllbGRzIGZvciBudWxsIGZpbHRlcmluZyAqL1xuICBudWxsRmlsdGVyOiBEaWN0PGJvb2xlYW4+O1xuXG4gIC8qKiBIYXNoc2V0IG9mIGEgZm9ybXVsYSBvYmplY3QgKi9cbiAgY2FsY3VsYXRlOiBEaWN0PEZvcm11bGE+O1xuXG4gIC8qKiBGaWx0ZXIgdGVzdCBleHByZXNzaW9uICovXG4gIGZpbHRlcjogc3RyaW5nO1xuXG4gIC8qKiBEaWN0aW9uYXJ5IG1hcHBpbmcgYSBiaW4gcGFyYW1ldGVyIGhhc2ggdG8gdHJhbnNmb3JtcyBvZiB0aGUgYmlubmVkIGZpZWxkICovXG4gIGJpbjogRGljdDxWZ1RyYW5zZm9ybVtdPjtcblxuICAvKiogRGljdGlvbmFyeSBtYXBwaW5nIGFuIG91dHB1dCBmaWVsZCBuYW1lIChoYXNoKSB0byB0aGUgdGltZSB1bml0IHRyYW5zZm9ybSAgKi9cbiAgdGltZVVuaXQ6IERpY3Q8VmdUcmFuc2Zvcm0+O1xuXG4gIC8qKiBTdHJpbmcgc2V0IG9mIGZpZWxkcyB0byBiZSBmaWx0ZXJlZCAqL1xuICBub25Qb3NpdGl2ZUZpbHRlcjogRGljdDxib29sZWFuPjtcblxuICAvKiogRGF0YSBzb3VyY2UgZm9yIGZlZWRpbmcgc3RhY2tlZCBzY2FsZS4gKi9cbiAgLy8gVE9ETzogbmVlZCB0byByZXZpc2UgaWYgc2luZ2xlIFZnRGF0YSBpcyBzdWZmaWNpZW50IHdpdGggbGF5ZXIgLyBjb25jYXRcbiAgc3RhY2tTY2FsZTogVmdEYXRhO1xuXG4gIC8qKiBEaWN0aW9uYXJ5IG1hcHBpbmcgYW4gb3V0cHV0IGZpZWxkIG5hbWUgKGhhc2gpIHRvIHRoZSBzb3J0IGFuZCByYW5rIHRyYW5zZm9ybXMgICovXG4gIGNvbG9yUmFuazogRGljdDxWZ1RyYW5zZm9ybVtdPjtcblxuICAvKiogU3RyaW5nIHNldCBvZiB0aW1lIHVuaXRzIHRoYXQgbmVlZCB0aGVpciBvd24gZGF0YSBzb3VyY2VzIGZvciBzY2FsZSBkb21haW4gKi9cbiAgdGltZVVuaXREb21haW46IFN0cmluZ1NldDtcblxuICAvKiogQXJyYXkgb2Ygc3VtbWFyeSBjb21wb25lbnQgb2JqZWN0IGZvciBwcm9kdWNpbmcgc3VtbWFyeSAoYWdncmVnYXRlKSBkYXRhIHNvdXJjZSAqL1xuICBzdW1tYXJ5OiBTdW1tYXJ5Q29tcG9uZW50W107XG59XG5cbi8qKlxuICogQ29tcG9zYWJsZSBjb21wb25lbnQgZm9yIGEgbW9kZWwncyBzdW1tYXJ5IGRhdGFcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTdW1tYXJ5Q29tcG9uZW50IHtcbiAgLyoqIE5hbWUgb2YgdGhlIHN1bW1hcnkgZGF0YSBzb3VyY2UgKi9cbiAgbmFtZTogc3RyaW5nO1xuXG4gIC8qKiBTdHJpbmcgc2V0IGZvciBhbGwgZGltZW5zaW9uIGZpZWxkcyAgKi9cbiAgZGltZW5zaW9uczogU3RyaW5nU2V0O1xuXG4gIC8qKiBkaWN0aW9uYXJ5IG1hcHBpbmcgZmllbGQgbmFtZSB0byBzdHJpbmcgc2V0IG9mIGFnZ3JlZ2F0ZSBvcHMgKi9cbiAgbWVhc3VyZXM6IERpY3Q8U3RyaW5nU2V0Pjtcbn1cblxuLy8gVE9ETzogc3BsaXQgdGhpcyBmaWxlIGludG8gbXVsdGlwbGUgZmlsZXMgYW5kIHJlbW92ZSB0aGlzIGxpbnRlciBmbGFnXG4vKiB0c2xpbnQ6ZGlzYWJsZTpuby11c2UtYmVmb3JlLWRlY2xhcmUgKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVW5pdERhdGEobW9kZWw6IFVuaXRNb2RlbCk6IERhdGFDb21wb25lbnQge1xuICByZXR1cm4ge1xuICAgIGZvcm1hdFBhcnNlOiBmb3JtYXRQYXJzZS5wYXJzZVVuaXQobW9kZWwpLFxuICAgIG51bGxGaWx0ZXI6IG51bGxGaWx0ZXIucGFyc2VVbml0KG1vZGVsKSxcbiAgICBmaWx0ZXI6IGZpbHRlci5wYXJzZVVuaXQobW9kZWwpLFxuICAgIG5vblBvc2l0aXZlRmlsdGVyOiBub25Qb3NpdGl2ZUZpbHRlci5wYXJzZVVuaXQobW9kZWwpLFxuXG4gICAgc291cmNlOiBzb3VyY2UucGFyc2VVbml0KG1vZGVsKSxcbiAgICBiaW46IGJpbi5wYXJzZVVuaXQobW9kZWwpLFxuICAgIGNhbGN1bGF0ZTogZm9ybXVsYS5wYXJzZVVuaXQobW9kZWwpLFxuICAgIHRpbWVVbml0OiB0aW1lVW5pdC5wYXJzZVVuaXQobW9kZWwpLFxuICAgIHRpbWVVbml0RG9tYWluOiB0aW1lVW5pdERvbWFpbi5wYXJzZVVuaXQobW9kZWwpLFxuICAgIHN1bW1hcnk6IHN1bW1hcnkucGFyc2VVbml0KG1vZGVsKSxcbiAgICBzdGFja1NjYWxlOiBzdGFja1NjYWxlLnBhcnNlVW5pdChtb2RlbCksXG4gICAgY29sb3JSYW5rOiBjb2xvclJhbmsucGFyc2VVbml0KG1vZGVsKVxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VGYWNldERhdGEobW9kZWw6IEZhY2V0TW9kZWwpOiBEYXRhQ29tcG9uZW50IHtcbiAgcmV0dXJuIHtcbiAgICBmb3JtYXRQYXJzZTogZm9ybWF0UGFyc2UucGFyc2VGYWNldChtb2RlbCksXG4gICAgbnVsbEZpbHRlcjogbnVsbEZpbHRlci5wYXJzZUZhY2V0KG1vZGVsKSxcbiAgICBmaWx0ZXI6IGZpbHRlci5wYXJzZUZhY2V0KG1vZGVsKSxcbiAgICBub25Qb3NpdGl2ZUZpbHRlcjogbm9uUG9zaXRpdmVGaWx0ZXIucGFyc2VGYWNldChtb2RlbCksXG5cbiAgICBzb3VyY2U6IHNvdXJjZS5wYXJzZUZhY2V0KG1vZGVsKSxcbiAgICBiaW46IGJpbi5wYXJzZUZhY2V0KG1vZGVsKSxcbiAgICBjYWxjdWxhdGU6IGZvcm11bGEucGFyc2VGYWNldChtb2RlbCksXG4gICAgdGltZVVuaXQ6IHRpbWVVbml0LnBhcnNlRmFjZXQobW9kZWwpLFxuICAgIHRpbWVVbml0RG9tYWluOiB0aW1lVW5pdERvbWFpbi5wYXJzZUZhY2V0KG1vZGVsKSxcbiAgICBzdW1tYXJ5OiBzdW1tYXJ5LnBhcnNlRmFjZXQobW9kZWwpLFxuICAgIHN0YWNrU2NhbGU6IHN0YWNrU2NhbGUucGFyc2VGYWNldChtb2RlbCksXG4gICAgY29sb3JSYW5rOiBjb2xvclJhbmsucGFyc2VGYWNldChtb2RlbClcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTGF5ZXJEYXRhKG1vZGVsOiBMYXllck1vZGVsKTogRGF0YUNvbXBvbmVudCB7XG4gIHJldHVybiB7XG4gICAgLy8gZmlsdGVyIGFuZCBmb3JtYXRQYXJzZSBjb3VsZCBjYXVzZSB1cyB0byBub3QgYmUgYWJsZSB0byBtZXJnZSBpbnRvIHBhcmVudFxuICAgIC8vIHNvIGxldCdzIHBhcnNlIHRoZW0gZmlyc3RcbiAgICBmaWx0ZXI6IGZpbHRlci5wYXJzZUxheWVyKG1vZGVsKSxcbiAgICBmb3JtYXRQYXJzZTogZm9ybWF0UGFyc2UucGFyc2VMYXllcihtb2RlbCksXG4gICAgbnVsbEZpbHRlcjogbnVsbEZpbHRlci5wYXJzZUxheWVyKG1vZGVsKSxcbiAgICBub25Qb3NpdGl2ZUZpbHRlcjogbm9uUG9zaXRpdmVGaWx0ZXIucGFyc2VMYXllcihtb2RlbCksXG5cbiAgICAvLyBldmVyeXRoaW5nIGFmdGVyIGhlcmUgZG9lcyBub3QgYWZmZWN0IHdoZXRoZXIgd2UgY2FuIG1lcmdlIGNoaWxkIGRhdGEgaW50byBwYXJlbnQgb3Igbm90XG4gICAgc291cmNlOiBzb3VyY2UucGFyc2VMYXllcihtb2RlbCksXG4gICAgYmluOiBiaW4ucGFyc2VMYXllcihtb2RlbCksXG4gICAgY2FsY3VsYXRlOiBmb3JtdWxhLnBhcnNlTGF5ZXIobW9kZWwpLFxuICAgIHRpbWVVbml0OiB0aW1lVW5pdC5wYXJzZUxheWVyKG1vZGVsKSxcbiAgICB0aW1lVW5pdERvbWFpbjogdGltZVVuaXREb21haW4ucGFyc2VMYXllcihtb2RlbCksXG4gICAgc3VtbWFyeTogc3VtbWFyeS5wYXJzZUxheWVyKG1vZGVsKSxcbiAgICBzdGFja1NjYWxlOiBzdGFja1NjYWxlLnBhcnNlTGF5ZXIobW9kZWwpLFxuICAgIGNvbG9yUmFuazogY29sb3JSYW5rLnBhcnNlTGF5ZXIobW9kZWwpXG4gIH07XG59XG5cblxuLyogdHNsaW50OmVuYWJsZTpuby11c2UtYmVmb3JlLWRlY2xhcmUgKi9cblxuLyoqXG4gKiBDcmVhdGVzIFZlZ2EgRGF0YSBhcnJheSBmcm9tIGEgZ2l2ZW4gY29tcGlsZWQgbW9kZWwgYW5kIGFwcGVuZCBhbGwgb2YgdGhlbSB0byB0aGUgZ2l2ZW4gYXJyYXlcbiAqXG4gKiBAcGFyYW0gIG1vZGVsXG4gKiBAcGFyYW0gIGRhdGEgYXJyYXlcbiAqIEByZXR1cm4gbW9kaWZpZWQgZGF0YSBhcnJheVxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZW1ibGVEYXRhKG1vZGVsOiBNb2RlbCwgZGF0YTogVmdEYXRhW10pIHtcbiAgY29uc3QgY29tcG9uZW50ID0gbW9kZWwuY29tcG9uZW50LmRhdGE7XG5cbiAgY29uc3Qgc291cmNlRGF0YSA9IHNvdXJjZS5hc3NlbWJsZShtb2RlbCwgY29tcG9uZW50KTtcbiAgaWYgKHNvdXJjZURhdGEpIHtcbiAgICBkYXRhLnB1c2goc291cmNlRGF0YSk7XG4gIH1cblxuICBzdW1tYXJ5LmFzc2VtYmxlKGNvbXBvbmVudCwgbW9kZWwpLmZvckVhY2goZnVuY3Rpb24oc3VtbWFyeURhdGEpIHtcbiAgICBkYXRhLnB1c2goc3VtbWFyeURhdGEpO1xuICB9KTtcblxuICBpZiAoZGF0YS5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgZGF0YVRhYmxlID0gZGF0YVtkYXRhLmxlbmd0aCAtIDFdO1xuXG4gICAgLy8gY29sb3IgcmFua1xuICAgIGNvbnN0IGNvbG9yUmFua1RyYW5zZm9ybSA9IGNvbG9yUmFuay5hc3NlbWJsZShjb21wb25lbnQpO1xuICAgIGlmIChjb2xvclJhbmtUcmFuc2Zvcm0ubGVuZ3RoID4gMCkge1xuICAgICAgZGF0YVRhYmxlLnRyYW5zZm9ybSA9IChkYXRhVGFibGUudHJhbnNmb3JtIHx8IFtdKS5jb25jYXQoY29sb3JSYW5rVHJhbnNmb3JtKTtcbiAgICB9XG5cbiAgICAvLyBub25Qb3NpdGl2ZUZpbHRlclxuICAgIGNvbnN0IG5vblBvc2l0aXZlRmlsdGVyVHJhbnNmb3JtID0gbm9uUG9zaXRpdmVGaWx0ZXIuYXNzZW1ibGUoY29tcG9uZW50KTtcbiAgICBpZiAobm9uUG9zaXRpdmVGaWx0ZXJUcmFuc2Zvcm0ubGVuZ3RoID4gMCkge1xuICAgICAgZGF0YVRhYmxlLnRyYW5zZm9ybSA9IChkYXRhVGFibGUudHJhbnNmb3JtIHx8IFtdKS5jb25jYXQobm9uUG9zaXRpdmVGaWx0ZXJUcmFuc2Zvcm0pO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoa2V5cyhjb21wb25lbnQuY29sb3JSYW5rKS5sZW5ndGggPiAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY29sb3JSYW5rIG5vdCBtZXJnZWQnKTtcbiAgICB9IGVsc2UgaWYgKGtleXMoY29tcG9uZW50Lm5vblBvc2l0aXZlRmlsdGVyKS5sZW5ndGggPiAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgbm9uUG9zaXRpdmVGaWx0ZXIgbm90IG1lcmdlZCcpO1xuICAgIH1cbiAgfVxuXG4gIC8vIHN0YWNrXG4gIC8vIFRPRE86IHJldmlzZSBpZiB0aGlzIGFjdHVhbGx5IHNob3VsZCBiZSBhbiBhcnJheVxuICBjb25zdCBzdGFja0RhdGEgPSBzdGFja1NjYWxlLmFzc2VtYmxlKGNvbXBvbmVudCk7XG4gIGlmIChzdGFja0RhdGEpIHtcbiAgICBkYXRhLnB1c2goc3RhY2tEYXRhKTtcbiAgfVxuXG4gIHRpbWVVbml0RG9tYWluLmFzc2VtYmxlKGNvbXBvbmVudCkuZm9yRWFjaChmdW5jdGlvbih0aW1lVW5pdERvbWFpbkRhdGEpIHtcbiAgICBkYXRhLnB1c2godGltZVVuaXREb21haW5EYXRhKTtcbiAgfSk7XG4gIHJldHVybiBkYXRhO1xufVxuIiwiaW1wb3J0IHtGYWNldE1vZGVsfSBmcm9tICcuLy4uL2ZhY2V0JztcbmltcG9ydCB7TGF5ZXJNb2RlbH0gZnJvbSAnLi8uLi9sYXllcic7XG5pbXBvcnQge01vZGVsfSBmcm9tICcuLy4uL21vZGVsJztcblxuaW1wb3J0IHtEYXRhQ29tcG9uZW50fSBmcm9tICcuL2RhdGEnO1xuXG5cbmV4cG9ydCBuYW1lc3BhY2UgZmlsdGVyIHtcbiAgZnVuY3Rpb24gcGFyc2UobW9kZWw6IE1vZGVsKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbW9kZWwudHJhbnNmb3JtKCkuZmlsdGVyO1xuICB9XG5cbiAgZXhwb3J0IGNvbnN0IHBhcnNlVW5pdCA9IHBhcnNlO1xuXG4gIGV4cG9ydCBmdW5jdGlvbiBwYXJzZUZhY2V0KG1vZGVsOiBGYWNldE1vZGVsKSB7XG4gICAgbGV0IGZpbHRlckNvbXBvbmVudCA9IHBhcnNlKG1vZGVsKTtcblxuICAgIGNvbnN0IGNoaWxkRGF0YUNvbXBvbmVudCA9IG1vZGVsLmNoaWxkKCkuY29tcG9uZW50LmRhdGE7XG5cbiAgICAvLyBJZiBjaGlsZCBkb2Vzbid0IGhhdmUgaXRzIG93biBkYXRhIHNvdXJjZSBidXQgaGFzIGZpbHRlciwgdGhlbiBtZXJnZVxuICAgIGlmICghY2hpbGREYXRhQ29tcG9uZW50LnNvdXJjZSAmJiBjaGlsZERhdGFDb21wb25lbnQuZmlsdGVyKSB7XG4gICAgICAvLyBtZXJnZSBieSBhZGRpbmcgJiZcbiAgICAgIGZpbHRlckNvbXBvbmVudCA9XG4gICAgICAgIChmaWx0ZXJDb21wb25lbnQgPyBmaWx0ZXJDb21wb25lbnQgKyAnICYmICcgOiAnJykgK1xuICAgICAgICBjaGlsZERhdGFDb21wb25lbnQuZmlsdGVyO1xuICAgICAgZGVsZXRlIGNoaWxkRGF0YUNvbXBvbmVudC5maWx0ZXI7XG4gICAgfVxuICAgIHJldHVybiBmaWx0ZXJDb21wb25lbnQ7XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gcGFyc2VMYXllcihtb2RlbDogTGF5ZXJNb2RlbCkge1xuICAgIC8vIE5vdGUgdGhhdCB0aGlzIGBmaWx0ZXIucGFyc2VMYXllcmAgbWV0aG9kIGlzIGNhbGxlZCBiZWZvcmUgYHNvdXJjZS5wYXJzZUxheWVyYFxuICAgIGxldCBmaWx0ZXJDb21wb25lbnQgPSBwYXJzZShtb2RlbCk7XG4gICAgbW9kZWwuY2hpbGRyZW4oKS5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgICAgY29uc3QgY2hpbGREYXRhQ29tcG9uZW50ID0gY2hpbGQuY29tcG9uZW50LmRhdGE7XG4gICAgICBpZiAobW9kZWwuY29tcGF0aWJsZVNvdXJjZShjaGlsZCkgJiYgY2hpbGREYXRhQ29tcG9uZW50LmZpbHRlciAmJiBjaGlsZERhdGFDb21wb25lbnQuZmlsdGVyID09PSBmaWx0ZXJDb21wb25lbnQpIHtcbiAgICAgICAgLy8gc2FtZSBmaWx0ZXIgaW4gY2hpbGQgc28gd2UgY2FuIGp1c3QgZGVsZXRlIGl0XG4gICAgICAgIGRlbGV0ZSBjaGlsZERhdGFDb21wb25lbnQuZmlsdGVyO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBmaWx0ZXJDb21wb25lbnQ7XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gYXNzZW1ibGUoY29tcG9uZW50OiBEYXRhQ29tcG9uZW50KSB7XG4gICAgY29uc3QgZmlsdGVyID0gY29tcG9uZW50LmZpbHRlcjtcbiAgICByZXR1cm4gZmlsdGVyID8gW3tcbiAgICAgIHR5cGU6ICdmaWx0ZXInLFxuICAgICAgdGVzdDogZmlsdGVyXG4gICAgfV0gOiBbXTtcbiAgfVxufVxuIiwiaW1wb3J0IHtGaWVsZERlZiwgaXNDb3VudH0gZnJvbSAnLi4vLi4vZmllbGRkZWYnO1xuaW1wb3J0IHtRVUFOVElUQVRJVkUsIFRFTVBPUkFMfSBmcm9tICcuLi8uLi90eXBlJztcbmltcG9ydCB7ZXh0ZW5kLCBkaWZmZXIsIERpY3R9IGZyb20gJy4uLy4uL3V0aWwnO1xuXG5pbXBvcnQge0ZhY2V0TW9kZWx9IGZyb20gJy4vLi4vZmFjZXQnO1xuaW1wb3J0IHtMYXllck1vZGVsfSBmcm9tICcuLy4uL2xheWVyJztcbmltcG9ydCB7TW9kZWx9IGZyb20gJy4vLi4vbW9kZWwnO1xuXG5leHBvcnQgbmFtZXNwYWNlIGZvcm1hdFBhcnNlIHtcbiAgLy8gVE9ETzogbmVlZCB0byB0YWtlIGNhbGN1bGF0ZSBpbnRvIGFjY291bnQgYWNyb3NzIGxldmVscyB3aGVuIG1lcmdpbmdcbiAgZnVuY3Rpb24gcGFyc2UobW9kZWw6IE1vZGVsKTogRGljdDxzdHJpbmc+IHtcbiAgICBjb25zdCBjYWxjRmllbGRNYXAgPSAobW9kZWwudHJhbnNmb3JtKCkuY2FsY3VsYXRlIHx8IFtdKS5yZWR1Y2UoZnVuY3Rpb24oZmllbGRNYXAsIGZvcm11bGEpIHtcbiAgICAgIGZpZWxkTWFwW2Zvcm11bGEuZmllbGRdID0gdHJ1ZTtcbiAgICAgIHJldHVybiBmaWVsZE1hcDtcbiAgICB9LCB7fSk7XG5cbiAgICBsZXQgcGFyc2VDb21wb25lbnQ6IERpY3Q8c3RyaW5nPiA9IHt9O1xuICAgIC8vIHVzZSBmb3JFYWNoIHJhdGhlciB0aGFuIHJlZHVjZSBzbyB0aGF0IGl0IGNhbiByZXR1cm4gdW5kZWZpbmVkXG4gICAgLy8gaWYgdGhlcmUgaXMgbm8gcGFyc2UgbmVlZGVkXG4gICAgbW9kZWwuZm9yRWFjaChmdW5jdGlvbihmaWVsZERlZjogRmllbGREZWYpIHtcbiAgICAgIGlmIChmaWVsZERlZi50eXBlID09PSBURU1QT1JBTCkge1xuICAgICAgICBwYXJzZUNvbXBvbmVudFtmaWVsZERlZi5maWVsZF0gPSAnZGF0ZSc7XG4gICAgICB9IGVsc2UgaWYgKGZpZWxkRGVmLnR5cGUgPT09IFFVQU5USVRBVElWRSkge1xuICAgICAgICBpZiAoaXNDb3VudChmaWVsZERlZikgfHwgY2FsY0ZpZWxkTWFwW2ZpZWxkRGVmLmZpZWxkXSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBwYXJzZUNvbXBvbmVudFtmaWVsZERlZi5maWVsZF0gPSAnbnVtYmVyJztcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcGFyc2VDb21wb25lbnQ7XG4gIH1cblxuICBleHBvcnQgY29uc3QgcGFyc2VVbml0ID0gcGFyc2U7XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRmFjZXQobW9kZWw6IEZhY2V0TW9kZWwpIHtcbiAgICBsZXQgcGFyc2VDb21wb25lbnQgPSBwYXJzZShtb2RlbCk7XG5cbiAgICAvLyBJZiBjaGlsZCBkb2Vzbid0IGhhdmUgaXRzIG93biBkYXRhIHNvdXJjZSwgYnV0IGhhcyBpdHMgb3duIHBhcnNlLCB0aGVuIG1lcmdlXG4gICAgY29uc3QgY2hpbGREYXRhQ29tcG9uZW50ID0gbW9kZWwuY2hpbGQoKS5jb21wb25lbnQuZGF0YTtcbiAgICBpZiAoIWNoaWxkRGF0YUNvbXBvbmVudC5zb3VyY2UgJiYgY2hpbGREYXRhQ29tcG9uZW50LmZvcm1hdFBhcnNlKSB7XG4gICAgICBleHRlbmQocGFyc2VDb21wb25lbnQsIGNoaWxkRGF0YUNvbXBvbmVudC5mb3JtYXRQYXJzZSk7XG4gICAgICBkZWxldGUgY2hpbGREYXRhQ29tcG9uZW50LmZvcm1hdFBhcnNlO1xuICAgIH1cbiAgICByZXR1cm4gcGFyc2VDb21wb25lbnQ7XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gcGFyc2VMYXllcihtb2RlbDogTGF5ZXJNb2RlbCkge1xuICAgIC8vIG5vdGUgdGhhdCB3ZSBydW4gdGhpcyBiZWZvcmUgc291cmNlLnBhcnNlTGF5ZXJcbiAgICBsZXQgcGFyc2VDb21wb25lbnQgPSBwYXJzZShtb2RlbCk7XG4gICAgbW9kZWwuY2hpbGRyZW4oKS5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgICAgY29uc3QgY2hpbGREYXRhQ29tcG9uZW50ID0gY2hpbGQuY29tcG9uZW50LmRhdGE7XG4gICAgICBpZiAobW9kZWwuY29tcGF0aWJsZVNvdXJjZShjaGlsZCkgJiYgIWRpZmZlcihjaGlsZERhdGFDb21wb25lbnQuZm9ybWF0UGFyc2UsIHBhcnNlQ29tcG9uZW50KSkge1xuICAgICAgICAvLyBtZXJnZSBwYXJzZSB1cCBpZiB0aGUgY2hpbGQgZG9lcyBub3QgaGF2ZSBhbiBpbmNvbXBhdGlibGUgcGFyc2VcbiAgICAgICAgZXh0ZW5kKHBhcnNlQ29tcG9uZW50LCBjaGlsZERhdGFDb21wb25lbnQuZm9ybWF0UGFyc2UpO1xuICAgICAgICBkZWxldGUgY2hpbGREYXRhQ29tcG9uZW50LmZvcm1hdFBhcnNlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBwYXJzZUNvbXBvbmVudDtcbiAgfVxuXG4gIC8vIEFzc2VtYmxlIGZvciBmb3JtYXRQYXJzZSBpcyBhbiBpZGVudGl0eSBmdW5jdGlvbiwgbm8gbmVlZCB0byBkZWNsYXJlXG59XG4iLCJpbXBvcnQge0Zvcm11bGF9IGZyb20gJy4uLy4uL3RyYW5zZm9ybSc7XG5pbXBvcnQge2V4dGVuZCwgdmFscywgaGFzaCwgRGljdH0gZnJvbSAnLi4vLi4vdXRpbCc7XG5cbmltcG9ydCB7RmFjZXRNb2RlbH0gZnJvbSAnLi8uLi9mYWNldCc7XG5pbXBvcnQge0xheWVyTW9kZWx9IGZyb20gJy4vLi4vbGF5ZXInO1xuaW1wb3J0IHtNb2RlbH0gZnJvbSAnLi8uLi9tb2RlbCc7XG5cbmltcG9ydCB7RGF0YUNvbXBvbmVudH0gZnJvbSAnLi9kYXRhJztcblxuXG5leHBvcnQgbmFtZXNwYWNlIGZvcm11bGEge1xuICBmdW5jdGlvbiBwYXJzZShtb2RlbDogTW9kZWwpOiBEaWN0PEZvcm11bGE+IHtcbiAgICByZXR1cm4gKG1vZGVsLnRyYW5zZm9ybSgpLmNhbGN1bGF0ZSB8fCBbXSkucmVkdWNlKGZ1bmN0aW9uKGZvcm11bGFDb21wb25lbnQsIGZvcm11bGEpIHtcbiAgICAgIGZvcm11bGFDb21wb25lbnRbaGFzaChmb3JtdWxhKV0gPSBmb3JtdWxhO1xuICAgICAgcmV0dXJuIGZvcm11bGFDb21wb25lbnQ7XG4gICAgfSwge30gYXMgRGljdDxGb3JtdWxhPik7XG4gIH1cblxuICBleHBvcnQgY29uc3QgcGFyc2VVbml0ID0gcGFyc2U7XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRmFjZXQobW9kZWw6IEZhY2V0TW9kZWwpIHtcbiAgICBsZXQgZm9ybXVsYUNvbXBvbmVudCA9IHBhcnNlKG1vZGVsKTtcblxuICAgIGNvbnN0IGNoaWxkRGF0YUNvbXBvbmVudCA9IG1vZGVsLmNoaWxkKCkuY29tcG9uZW50LmRhdGE7XG5cbiAgICAvLyBJZiBjaGlsZCBkb2Vzbid0IGhhdmUgaXRzIG93biBkYXRhIHNvdXJjZSwgdGhlbiBtZXJnZVxuICAgIGlmICghY2hpbGREYXRhQ29tcG9uZW50LnNvdXJjZSkge1xuICAgICAgZXh0ZW5kKGZvcm11bGFDb21wb25lbnQsIGNoaWxkRGF0YUNvbXBvbmVudC5jYWxjdWxhdGUpO1xuICAgICAgZGVsZXRlIGNoaWxkRGF0YUNvbXBvbmVudC5jYWxjdWxhdGU7XG4gICAgfVxuICAgIHJldHVybiBmb3JtdWxhQ29tcG9uZW50O1xuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTGF5ZXIobW9kZWw6IExheWVyTW9kZWwpIHtcbiAgICBsZXQgZm9ybXVsYUNvbXBvbmVudCA9IHBhcnNlKG1vZGVsKTtcbiAgICBtb2RlbC5jaGlsZHJlbigpLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgICBjb25zdCBjaGlsZERhdGFDb21wb25lbnQgPSBjaGlsZC5jb21wb25lbnQuZGF0YTtcbiAgICAgIGlmICghY2hpbGREYXRhQ29tcG9uZW50LnNvdXJjZSAmJiBjaGlsZERhdGFDb21wb25lbnQuY2FsY3VsYXRlKSB7XG4gICAgICAgIGV4dGVuZChmb3JtdWxhQ29tcG9uZW50IHx8IHt9LCBjaGlsZERhdGFDb21wb25lbnQuY2FsY3VsYXRlKTtcbiAgICAgICAgZGVsZXRlIGNoaWxkRGF0YUNvbXBvbmVudC5jYWxjdWxhdGU7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGZvcm11bGFDb21wb25lbnQ7XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gYXNzZW1ibGUoY29tcG9uZW50OiBEYXRhQ29tcG9uZW50KSB7XG4gICAgcmV0dXJuIHZhbHMoY29tcG9uZW50LmNhbGN1bGF0ZSkucmVkdWNlKGZ1bmN0aW9uKHRyYW5zZm9ybSwgZm9ybXVsYSkge1xuICAgICAgdHJhbnNmb3JtLnB1c2goZXh0ZW5kKHsgdHlwZTogJ2Zvcm11bGEnIH0sIGZvcm11bGEpKTtcbiAgICAgIHJldHVybiB0cmFuc2Zvcm07XG4gICAgfSwgW10pO1xuICB9XG59XG4iLCJpbXBvcnQge1NjYWxlVHlwZX0gZnJvbSAnLi4vLi4vc2NhbGUnO1xuaW1wb3J0IHtleHRlbmQsIGtleXMsIGRpZmZlciwgRGljdH0gZnJvbSAnLi4vLi4vdXRpbCc7XG5cbmltcG9ydCB7RmFjZXRNb2RlbH0gZnJvbSAnLi8uLi9mYWNldCc7XG5pbXBvcnQge0xheWVyTW9kZWx9IGZyb20gJy4vLi4vbGF5ZXInO1xuaW1wb3J0IHtNb2RlbH0gZnJvbSAnLi8uLi9tb2RlbCc7XG5cbmltcG9ydCB7RGF0YUNvbXBvbmVudH0gZnJvbSAnLi9kYXRhJztcblxuLyoqXG4gKiBGaWx0ZXIgbm9uLXBvc2l0aXZlIHZhbHVlIGZvciBsb2cgc2NhbGVcbiAqL1xuZXhwb3J0IG5hbWVzcGFjZSBub25Qb3NpdGl2ZUZpbHRlciB7XG4gIGV4cG9ydCBmdW5jdGlvbiBwYXJzZVVuaXQobW9kZWw6IE1vZGVsKTogRGljdDxib29sZWFuPiB7XG4gICAgcmV0dXJuIG1vZGVsLmNoYW5uZWxzKCkucmVkdWNlKGZ1bmN0aW9uKG5vblBvc2l0aXZlQ29tcG9uZW50LCBjaGFubmVsKSB7XG4gICAgICBjb25zdCBzY2FsZSA9IG1vZGVsLnNjYWxlKGNoYW5uZWwpO1xuICAgICAgaWYgKCFtb2RlbC5maWVsZChjaGFubmVsKSB8fCAhc2NhbGUpIHtcbiAgICAgICAgLy8gZG9uJ3Qgc2V0IGFueXRoaW5nXG4gICAgICAgIHJldHVybiBub25Qb3NpdGl2ZUNvbXBvbmVudDtcbiAgICAgIH1cbiAgICAgIG5vblBvc2l0aXZlQ29tcG9uZW50W21vZGVsLmZpZWxkKGNoYW5uZWwpXSA9IHNjYWxlLnR5cGUgPT09IFNjYWxlVHlwZS5MT0c7XG4gICAgICByZXR1cm4gbm9uUG9zaXRpdmVDb21wb25lbnQ7XG4gICAgfSwge30gYXMgRGljdDxib29sZWFuPik7XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gcGFyc2VGYWNldChtb2RlbDogRmFjZXRNb2RlbCkge1xuICAgIGNvbnN0IGNoaWxkRGF0YUNvbXBvbmVudCA9IG1vZGVsLmNoaWxkKCkuY29tcG9uZW50LmRhdGE7XG5cbiAgICAvLyBJZiBjaGlsZCBkb2Vzbid0IGhhdmUgaXRzIG93biBkYXRhIHNvdXJjZSwgdGhlbiBjb25zaWRlciBtZXJnaW5nXG4gICAgaWYgKCFjaGlsZERhdGFDb21wb25lbnQuc291cmNlKSB7XG4gICAgICAvLyBGb3Igbm93LCBsZXQncyBhc3N1bWUgaXQgYWx3YXlzIGhhcyB1bmlvbiBzY2FsZVxuICAgICAgY29uc3Qgbm9uUG9zaXRpdmVGaWx0ZXJDb21wb25lbnQgPSBjaGlsZERhdGFDb21wb25lbnQubm9uUG9zaXRpdmVGaWx0ZXI7XG4gICAgICBkZWxldGUgY2hpbGREYXRhQ29tcG9uZW50Lm5vblBvc2l0aXZlRmlsdGVyO1xuICAgICAgcmV0dXJuIG5vblBvc2l0aXZlRmlsdGVyQ29tcG9uZW50O1xuICAgIH1cbiAgICByZXR1cm4ge30gYXMgRGljdDxib29sZWFuPjtcbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiBwYXJzZUxheWVyKG1vZGVsOiBMYXllck1vZGVsKSB7XG4gICAgLy8gbm90ZSB0aGF0IHdlIHJ1biB0aGlzIGJlZm9yZSBzb3VyY2UucGFyc2VMYXllclxuICAgIGxldCBub25Qb3NpdGl2ZUZpbHRlciA9IHt9IGFzIERpY3Q8Ym9vbGVhbj47XG5cbiAgICBtb2RlbC5jaGlsZHJlbigpLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgICBjb25zdCBjaGlsZERhdGFDb21wb25lbnQgPSBjaGlsZC5jb21wb25lbnQuZGF0YTtcbiAgICAgIGlmIChtb2RlbC5jb21wYXRpYmxlU291cmNlKGNoaWxkKSAmJiAhZGlmZmVyKGNoaWxkRGF0YUNvbXBvbmVudC5ub25Qb3NpdGl2ZUZpbHRlciwgbm9uUG9zaXRpdmVGaWx0ZXIpKSB7XG4gICAgICAgIGV4dGVuZChub25Qb3NpdGl2ZUZpbHRlciwgY2hpbGREYXRhQ29tcG9uZW50Lm5vblBvc2l0aXZlRmlsdGVyKTtcbiAgICAgICAgZGVsZXRlIGNoaWxkRGF0YUNvbXBvbmVudC5ub25Qb3NpdGl2ZUZpbHRlcjtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBub25Qb3NpdGl2ZUZpbHRlcjtcbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiBhc3NlbWJsZShjb21wb25lbnQ6IERhdGFDb21wb25lbnQpIHtcbiAgICByZXR1cm4ga2V5cyhjb21wb25lbnQubm9uUG9zaXRpdmVGaWx0ZXIpLmZpbHRlcigoZmllbGQpID0+IHtcbiAgICAgIC8vIE9ubHkgZmlsdGVyIGZpZWxkcyAoa2V5cykgd2l0aCB2YWx1ZSA9IHRydWVcbiAgICAgIHJldHVybiBjb21wb25lbnQubm9uUG9zaXRpdmVGaWx0ZXJbZmllbGRdO1xuICAgIH0pLm1hcChmdW5jdGlvbihmaWVsZCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2ZpbHRlcicsXG4gICAgICAgIHRlc3Q6ICdkYXR1bS4nICsgZmllbGQgKyAnID4gMCdcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cbn1cbiIsImltcG9ydCB7RmllbGREZWZ9IGZyb20gJy4uLy4uL2ZpZWxkZGVmJztcbmltcG9ydCB7ZXh0ZW5kLCBrZXlzLCBkaWZmZXIsIERpY3R9IGZyb20gJy4uLy4uL3V0aWwnO1xuXG5pbXBvcnQge0ZhY2V0TW9kZWx9IGZyb20gJy4vLi4vZmFjZXQnO1xuaW1wb3J0IHtMYXllck1vZGVsfSBmcm9tICcuLy4uL2xheWVyJztcbmltcG9ydCB7TW9kZWx9IGZyb20gJy4vLi4vbW9kZWwnO1xuXG5pbXBvcnQge0RhdGFDb21wb25lbnR9IGZyb20gJy4vZGF0YSc7XG5cbmNvbnN0IERFRkFVTFRfTlVMTF9GSUxURVJTID0ge1xuICBub21pbmFsOiBmYWxzZSxcbiAgb3JkaW5hbDogZmFsc2UsXG4gIHF1YW50aXRhdGl2ZTogdHJ1ZSxcbiAgdGVtcG9yYWw6IHRydWVcbn07XG5cbmV4cG9ydCBuYW1lc3BhY2UgbnVsbEZpbHRlciB7XG4gIC8qKiBSZXR1cm4gSGFzaHNldCBvZiBmaWVsZHMgZm9yIG51bGwgZmlsdGVyaW5nIChrZXk9ZmllbGQsIHZhbHVlID0gdHJ1ZSkuICovXG4gIGZ1bmN0aW9uIHBhcnNlKG1vZGVsOiBNb2RlbCk6IERpY3Q8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGZpbHRlck51bGwgPSBtb2RlbC50cmFuc2Zvcm0oKS5maWx0ZXJOdWxsO1xuICAgIHJldHVybiBtb2RlbC5yZWR1Y2UoZnVuY3Rpb24oYWdncmVnYXRvciwgZmllbGREZWY6IEZpZWxkRGVmKSB7XG4gICAgICBpZiAoZmlsdGVyTnVsbCB8fFxuICAgICAgICAoZmlsdGVyTnVsbCA9PT0gdW5kZWZpbmVkICYmIGZpZWxkRGVmLmZpZWxkICYmIGZpZWxkRGVmLmZpZWxkICE9PSAnKicgJiYgREVGQVVMVF9OVUxMX0ZJTFRFUlNbZmllbGREZWYudHlwZV0pKSB7XG4gICAgICAgIGFnZ3JlZ2F0b3JbZmllbGREZWYuZmllbGRdID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGRlZmluZSB0aGlzIHNvIHdlIGtub3cgdGhhdCB3ZSBkb24ndCBmaWx0ZXIgbnVsbHMgZm9yIHRoaXMgZmllbGRcbiAgICAgICAgLy8gdGhpcyBtYWtlcyBpdCBlYXNpZXIgdG8gbWVyZ2UgaW50byBwYXJlbnRzXG4gICAgICAgIGFnZ3JlZ2F0b3JbZmllbGREZWYuZmllbGRdID0gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gYWdncmVnYXRvcjtcbiAgICB9LCB7fSk7XG4gIH1cblxuICBleHBvcnQgY29uc3QgcGFyc2VVbml0ID0gcGFyc2U7XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRmFjZXQobW9kZWw6IEZhY2V0TW9kZWwpIHtcbiAgICBsZXQgbnVsbEZpbHRlckNvbXBvbmVudCA9IHBhcnNlKG1vZGVsKTtcblxuICAgIGNvbnN0IGNoaWxkRGF0YUNvbXBvbmVudCA9IG1vZGVsLmNoaWxkKCkuY29tcG9uZW50LmRhdGE7XG5cbiAgICAvLyBJZiBjaGlsZCBkb2Vzbid0IGhhdmUgaXRzIG93biBkYXRhIHNvdXJjZSwgdGhlbiBtZXJnZVxuICAgIGlmICghY2hpbGREYXRhQ29tcG9uZW50LnNvdXJjZSkge1xuICAgICAgZXh0ZW5kKG51bGxGaWx0ZXJDb21wb25lbnQsIGNoaWxkRGF0YUNvbXBvbmVudC5udWxsRmlsdGVyKTtcbiAgICAgIGRlbGV0ZSBjaGlsZERhdGFDb21wb25lbnQubnVsbEZpbHRlcjtcbiAgICB9XG4gICAgcmV0dXJuIG51bGxGaWx0ZXJDb21wb25lbnQ7XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gcGFyc2VMYXllcihtb2RlbDogTGF5ZXJNb2RlbCkge1xuICAgIC8vIG5vdGUgdGhhdCB3ZSBydW4gdGhpcyBiZWZvcmUgc291cmNlLnBhcnNlTGF5ZXJcblxuICAgIC8vIEZJWE1FOiBudWxsIGZpbHRlcnMgYXJlIG5vdCBwcm9wZXJseSBwcm9wYWdhdGVkIHJpZ2h0IG5vd1xuICAgIGxldCBudWxsRmlsdGVyQ29tcG9uZW50ID0gcGFyc2UobW9kZWwpO1xuXG4gICAgbW9kZWwuY2hpbGRyZW4oKS5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgICAgY29uc3QgY2hpbGREYXRhQ29tcG9uZW50ID0gY2hpbGQuY29tcG9uZW50LmRhdGE7XG4gICAgICBpZiAobW9kZWwuY29tcGF0aWJsZVNvdXJjZShjaGlsZCkgJiYgIWRpZmZlcihjaGlsZERhdGFDb21wb25lbnQubnVsbEZpbHRlciwgbnVsbEZpbHRlckNvbXBvbmVudCkpIHtcbiAgICAgICAgZXh0ZW5kKG51bGxGaWx0ZXJDb21wb25lbnQsIGNoaWxkRGF0YUNvbXBvbmVudC5udWxsRmlsdGVyKTtcbiAgICAgICAgZGVsZXRlIGNoaWxkRGF0YUNvbXBvbmVudC5udWxsRmlsdGVyO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIG51bGxGaWx0ZXJDb21wb25lbnQ7XG4gIH1cblxuICAvKiogQ29udmVydCB0aGUgaGFzaHNldCBvZiBmaWVsZHMgdG8gYSBmaWx0ZXIgdHJhbnNmb3JtLiAgKi9cbiAgZXhwb3J0IGZ1bmN0aW9uIGFzc2VtYmxlKGNvbXBvbmVudDogRGF0YUNvbXBvbmVudCkge1xuICAgIGNvbnN0IGZpbHRlcmVkRmllbGRzID0ga2V5cyhjb21wb25lbnQubnVsbEZpbHRlcikuZmlsdGVyKChmaWVsZCkgPT4ge1xuICAgICAgLy8gb25seSBpbmNsdWRlIGZpZWxkcyB0aGF0IGhhcyB2YWx1ZSA9IHRydWVcbiAgICAgIHJldHVybiBjb21wb25lbnQubnVsbEZpbHRlcltmaWVsZF07XG4gICAgfSk7XG4gICAgcmV0dXJuIGZpbHRlcmVkRmllbGRzLmxlbmd0aCA+IDAgP1xuICAgICAgW3tcbiAgICAgICAgdHlwZTogJ2ZpbHRlcicsXG4gICAgICAgIHRlc3Q6IGZpbHRlcmVkRmllbGRzLm1hcChmdW5jdGlvbihmaWVsZE5hbWUpIHtcbiAgICAgICAgICByZXR1cm4gJ2RhdHVtLicgKyBmaWVsZE5hbWUgKyAnIT09bnVsbCc7XG4gICAgICAgIH0pLmpvaW4oJyAmJiAnKVxuICAgICAgfV0gOiBbXTtcbiAgfVxufVxuIiwiaW1wb3J0IHtTT1VSQ0V9IGZyb20gJy4uLy4uL2RhdGEnO1xuaW1wb3J0IHtjb250YWluc30gZnJvbSAnLi4vLi4vdXRpbCc7XG5pbXBvcnQge1ZnRGF0YX0gZnJvbSAnLi4vLi4vdmVnYS5zY2hlbWEnO1xuXG5pbXBvcnQge0ZhY2V0TW9kZWx9IGZyb20gJy4vLi4vZmFjZXQnO1xuaW1wb3J0IHtMYXllck1vZGVsfSBmcm9tICcuLy4uL2xheWVyJztcbmltcG9ydCB7TW9kZWx9IGZyb20gJy4vLi4vbW9kZWwnO1xuXG5pbXBvcnQge0RhdGFDb21wb25lbnR9IGZyb20gJy4vZGF0YSc7XG5pbXBvcnQge251bGxGaWx0ZXJ9IGZyb20gJy4vbnVsbGZpbHRlcic7XG5pbXBvcnQge2ZpbHRlcn0gZnJvbSAnLi9maWx0ZXInO1xuaW1wb3J0IHtiaW59IGZyb20gJy4vYmluJztcbmltcG9ydCB7Zm9ybXVsYX0gZnJvbSAnLi9mb3JtdWxhJztcbmltcG9ydCB7dGltZVVuaXR9IGZyb20gJy4vdGltZXVuaXQnO1xuXG5leHBvcnQgbmFtZXNwYWNlIHNvdXJjZSB7XG4gIGZ1bmN0aW9uIHBhcnNlKG1vZGVsOiBNb2RlbCk6IFZnRGF0YSB7XG4gICAgbGV0IGRhdGEgPSBtb2RlbC5kYXRhKCk7XG5cbiAgICBpZiAoZGF0YSkge1xuICAgICAgLy8gSWYgZGF0YSBpcyBleHBsaWNpdGx5IHByb3ZpZGVkXG5cbiAgICAgIGxldCBzb3VyY2VEYXRhOiBWZ0RhdGEgPSB7IG5hbWU6IG1vZGVsLmRhdGFOYW1lKFNPVVJDRSkgfTtcbiAgICAgIGlmIChkYXRhLnZhbHVlcyAmJiBkYXRhLnZhbHVlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHNvdXJjZURhdGEudmFsdWVzID0gbW9kZWwuZGF0YSgpLnZhbHVlcztcbiAgICAgICAgc291cmNlRGF0YS5mb3JtYXQgPSB7IHR5cGU6ICdqc29uJyB9O1xuICAgICAgfSBlbHNlIGlmIChkYXRhLnVybCkge1xuICAgICAgICBzb3VyY2VEYXRhLnVybCA9IGRhdGEudXJsO1xuXG4gICAgICAgIC8vIEV4dHJhY3QgZXh0ZW5zaW9uIGZyb20gVVJMIHVzaW5nIHNuaXBwZXQgZnJvbVxuICAgICAgICAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzY4MDkyOS9ob3ctdG8tZXh0cmFjdC1leHRlbnNpb24tZnJvbS1maWxlbmFtZS1zdHJpbmctaW4tamF2YXNjcmlwdFxuICAgICAgICBsZXQgZGVmYXVsdEV4dGVuc2lvbiA9IC8oPzpcXC4oW14uXSspKT8kLy5leGVjKHNvdXJjZURhdGEudXJsKVsxXTtcbiAgICAgICAgaWYgKCFjb250YWlucyhbJ2pzb24nLCAnY3N2JywgJ3RzdiddLCBkZWZhdWx0RXh0ZW5zaW9uKSkge1xuICAgICAgICAgIGRlZmF1bHRFeHRlbnNpb24gPSAnanNvbic7XG4gICAgICAgIH1cbiAgICAgICAgc291cmNlRGF0YS5mb3JtYXQgPSB7IHR5cGU6IG1vZGVsLmRhdGEoKS5mb3JtYXRUeXBlIHx8IGRlZmF1bHRFeHRlbnNpb24gfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzb3VyY2VEYXRhO1xuICAgIH0gZWxzZSBpZiAoIW1vZGVsLnBhcmVudCgpKSB7XG4gICAgICAvLyBJZiBkYXRhIGlzIG5vdCBleHBsaWNpdGx5IHByb3ZpZGVkIGJ1dCB0aGUgbW9kZWwgaXMgYSByb290LFxuICAgICAgLy8gbmVlZCB0byBwcm9kdWNlIGEgc291cmNlIGFzIHdlbGxcbiAgICAgIHJldHVybiB7IG5hbWU6IG1vZGVsLmRhdGFOYW1lKFNPVVJDRSkgfTtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIGV4cG9ydCBjb25zdCBwYXJzZVVuaXQgPSBwYXJzZTtcblxuICBleHBvcnQgZnVuY3Rpb24gcGFyc2VGYWNldChtb2RlbDogRmFjZXRNb2RlbCkge1xuICAgIGxldCBzb3VyY2VEYXRhID0gcGFyc2UobW9kZWwpO1xuICAgIGlmICghbW9kZWwuY2hpbGQoKS5jb21wb25lbnQuZGF0YS5zb3VyY2UpIHtcbiAgICAgIC8vIElmIHRoZSBjaGlsZCBkb2VzIG5vdCBoYXZlIGl0cyBvd24gc291cmNlLCBoYXZlIHRvIHJlbmFtZSBpdHMgc291cmNlLlxuICAgICAgbW9kZWwuY2hpbGQoKS5yZW5hbWVEYXRhKG1vZGVsLmNoaWxkKCkuZGF0YU5hbWUoU09VUkNFKSwgbW9kZWwuZGF0YU5hbWUoU09VUkNFKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNvdXJjZURhdGE7XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gcGFyc2VMYXllcihtb2RlbDogTGF5ZXJNb2RlbCkge1xuICAgIGxldCBzb3VyY2VEYXRhID0gcGFyc2UobW9kZWwpO1xuICAgIG1vZGVsLmNoaWxkcmVuKCkuZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgIGNvbnN0IGNoaWxkRGF0YSA9IGNoaWxkLmNvbXBvbmVudC5kYXRhO1xuXG4gICAgICBpZiAobW9kZWwuY29tcGF0aWJsZVNvdXJjZShjaGlsZCkpIHtcbiAgICAgICAgLy8gd2UgY2Fubm90IG1lcmdlIGlmIHRoZSBjaGlsZCBoYXMgZmlsdGVycyBkZWZpbmVkIGV2ZW4gYWZ0ZXIgd2UgdHJpZWQgdG8gbW92ZSB0aGVtIHVwXG4gICAgICAgIGNvbnN0IGNhbk1lcmdlID0gIWNoaWxkRGF0YS5maWx0ZXIgJiYgIWNoaWxkRGF0YS5mb3JtYXRQYXJzZSAmJiAhY2hpbGREYXRhLm51bGxGaWx0ZXI7XG4gICAgICAgIGlmIChjYW5NZXJnZSkge1xuICAgICAgICAgIC8vIHJlbmFtZSBzb3VyY2UgYmVjYXVzZSB3ZSBjYW4ganVzdCByZW1vdmUgaXRcbiAgICAgICAgICBjaGlsZC5yZW5hbWVEYXRhKGNoaWxkLmRhdGFOYW1lKFNPVVJDRSksIG1vZGVsLmRhdGFOYW1lKFNPVVJDRSkpO1xuICAgICAgICAgIGRlbGV0ZSBjaGlsZERhdGEuc291cmNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGNoaWxkIGRvZXMgbm90IGhhdmUgZGF0YSBkZWZpbmVkIG9yIHRoZSBzYW1lIHNvdXJjZSBzbyBqdXN0IHVzZSB0aGUgcGFyZW50cyBzb3VyY2VcbiAgICAgICAgICBjaGlsZERhdGEuc291cmNlID0ge1xuICAgICAgICAgICAgbmFtZTogY2hpbGQuZGF0YU5hbWUoU09VUkNFKSxcbiAgICAgICAgICAgIHNvdXJjZTogbW9kZWwuZGF0YU5hbWUoU09VUkNFKVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gc291cmNlRGF0YTtcbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiBhc3NlbWJsZShtb2RlbDogTW9kZWwsIGNvbXBvbmVudDogRGF0YUNvbXBvbmVudCkge1xuICAgIGlmIChjb21wb25lbnQuc291cmNlKSB7XG4gICAgICBsZXQgc291cmNlRGF0YTogVmdEYXRhID0gY29tcG9uZW50LnNvdXJjZTtcblxuICAgICAgaWYgKGNvbXBvbmVudC5mb3JtYXRQYXJzZSkge1xuICAgICAgICBjb21wb25lbnQuc291cmNlLmZvcm1hdCA9IGNvbXBvbmVudC5zb3VyY2UuZm9ybWF0IHx8IHt9O1xuICAgICAgICBjb21wb25lbnQuc291cmNlLmZvcm1hdC5wYXJzZSA9IGNvbXBvbmVudC5mb3JtYXRQYXJzZTtcbiAgICAgIH1cblxuICAgICAgLy8gbnVsbCBmaWx0ZXIgY29tZXMgZmlyc3Qgc28gdHJhbnNmb3JtcyBhcmUgbm90IHBlcmZvcm1lZCBvbiBudWxsIHZhbHVlc1xuICAgICAgLy8gdGltZSBhbmQgYmluIHNob3VsZCBjb21lIGJlZm9yZSBmaWx0ZXIgc28gd2UgY2FuIGZpbHRlciBieSB0aW1lIGFuZCBiaW5cbiAgICAgIHNvdXJjZURhdGEudHJhbnNmb3JtID0gW10uY29uY2F0KFxuICAgICAgICBudWxsRmlsdGVyLmFzc2VtYmxlKGNvbXBvbmVudCksXG4gICAgICAgIGZvcm11bGEuYXNzZW1ibGUoY29tcG9uZW50KSxcbiAgICAgICAgZmlsdGVyLmFzc2VtYmxlKGNvbXBvbmVudCksXG4gICAgICAgIGJpbi5hc3NlbWJsZShjb21wb25lbnQpLFxuICAgICAgICB0aW1lVW5pdC5hc3NlbWJsZShjb21wb25lbnQpXG4gICAgICApO1xuXG4gICAgICByZXR1cm4gc291cmNlRGF0YTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cbiIsImltcG9ydCB7U1RBQ0tFRF9TQ0FMRSwgU1VNTUFSWX0gZnJvbSAnLi4vLi4vZGF0YSc7XG5pbXBvcnQge2ZpZWxkfSBmcm9tICcuLi8uLi9maWVsZGRlZic7XG5pbXBvcnQge1ZnRGF0YX0gZnJvbSAnLi4vLi4vdmVnYS5zY2hlbWEnO1xuXG5pbXBvcnQge0ZhY2V0TW9kZWx9IGZyb20gJy4vLi4vZmFjZXQnO1xuaW1wb3J0IHtMYXllck1vZGVsfSBmcm9tICcuLy4uL2xheWVyJztcbmltcG9ydCB7VW5pdE1vZGVsfSBmcm9tICcuLy4uL3VuaXQnO1xuXG5pbXBvcnQge0RhdGFDb21wb25lbnR9IGZyb20gJy4vZGF0YSc7XG5cblxuLyoqXG4gKiBTdGFja2VkIHNjYWxlIGRhdGEgc291cmNlLCBmb3IgZmVlZGluZyB0aGUgc2hhcmVkIHNjYWxlLlxuICovXG5leHBvcnQgbmFtZXNwYWNlIHN0YWNrU2NhbGUge1xuICBleHBvcnQgZnVuY3Rpb24gcGFyc2VVbml0KG1vZGVsOiBVbml0TW9kZWwpOiBWZ0RhdGEge1xuICAgIGNvbnN0IHN0YWNrUHJvcHMgPSBtb2RlbC5zdGFjaygpO1xuXG4gICAgaWYgKHN0YWNrUHJvcHMpIHtcbiAgICAgIC8vIHByb2R1Y2Ugc3RhY2tlZCBzY2FsZVxuICAgICAgY29uc3QgZ3JvdXBieUNoYW5uZWwgPSBzdGFja1Byb3BzLmdyb3VwYnlDaGFubmVsO1xuICAgICAgY29uc3QgZmllbGRDaGFubmVsID0gc3RhY2tQcm9wcy5maWVsZENoYW5uZWw7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBuYW1lOiBtb2RlbC5kYXRhTmFtZShTVEFDS0VEX1NDQUxFKSxcbiAgICAgICAgc291cmNlOiBtb2RlbC5kYXRhTmFtZShTVU1NQVJZKSwgLy8gYWx3YXlzIHN1bW1hcnkgYmVjYXVzZSBzdGFja2VkIG9ubHkgd29ya3Mgd2l0aCBhZ2dyZWdhdGlvblxuICAgICAgICB0cmFuc2Zvcm06IFt7XG4gICAgICAgICAgdHlwZTogJ2FnZ3JlZ2F0ZScsXG4gICAgICAgICAgLy8gZ3JvdXAgYnkgY2hhbm5lbCBhbmQgb3RoZXIgZmFjZXRzXG4gICAgICAgICAgZ3JvdXBieTogW21vZGVsLmZpZWxkKGdyb3VwYnlDaGFubmVsKV0sXG4gICAgICAgICAgLy8gcHJvZHVjZSBzdW0gb2YgdGhlIGZpZWxkJ3MgdmFsdWUgZS5nLiwgc3VtIG9mIHN1bSwgc3VtIG9mIGRpc3RpbmN0XG4gICAgICAgICAgc3VtbWFyaXplOiBbeyBvcHM6IFsnc3VtJ10sIGZpZWxkOiBtb2RlbC5maWVsZChmaWVsZENoYW5uZWwpIH1dXG4gICAgICAgIH1dXG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICBleHBvcnQgZnVuY3Rpb24gcGFyc2VGYWNldChtb2RlbDogRmFjZXRNb2RlbCkge1xuICAgIGNvbnN0IGNoaWxkID0gbW9kZWwuY2hpbGQoKTtcbiAgICBjb25zdCBjaGlsZERhdGFDb21wb25lbnQgPSBjaGlsZC5jb21wb25lbnQuZGF0YTtcblxuICAgIC8vIElmIGNoaWxkIGRvZXNuJ3QgaGF2ZSBpdHMgb3duIGRhdGEgc291cmNlLCBidXQgaGFzIHN0YWNrIHNjYWxlIHNvdXJjZSwgdGhlbiBtZXJnZVxuICAgIGlmICghY2hpbGREYXRhQ29tcG9uZW50LnNvdXJjZSAmJiBjaGlsZERhdGFDb21wb25lbnQuc3RhY2tTY2FsZSkge1xuICAgICAgbGV0IHN0YWNrQ29tcG9uZW50ID0gY2hpbGREYXRhQ29tcG9uZW50LnN0YWNrU2NhbGU7XG5cbiAgICAgIGNvbnN0IG5ld05hbWUgPSBtb2RlbC5kYXRhTmFtZShTVEFDS0VEX1NDQUxFKTtcbiAgICAgIGNoaWxkLnJlbmFtZURhdGEoc3RhY2tDb21wb25lbnQubmFtZSwgbmV3TmFtZSk7XG4gICAgICBzdGFja0NvbXBvbmVudC5uYW1lID0gbmV3TmFtZTtcblxuICAgICAgLy8gUmVmZXIgdG8gZmFjZXQncyBzdW1tYXJ5IGluc3RlYWQgKGFsd2F5cyBzdW1tYXJ5IGJlY2F1c2Ugc3RhY2tlZCBvbmx5IHdvcmtzIHdpdGggYWdncmVnYXRpb24pXG4gICAgICBzdGFja0NvbXBvbmVudC5zb3VyY2UgPSBtb2RlbC5kYXRhTmFtZShTVU1NQVJZKTtcblxuICAgICAgLy8gQWRkIG1vcmUgZGltZW5zaW9ucyBmb3Igcm93L2NvbHVtblxuICAgICAgc3RhY2tDb21wb25lbnQudHJhbnNmb3JtWzBdLmdyb3VwYnkgPSBtb2RlbC5yZWR1Y2UoZnVuY3Rpb24oZ3JvdXBieSwgZmllbGREZWYpIHtcbiAgICAgICAgZ3JvdXBieS5wdXNoKGZpZWxkKGZpZWxkRGVmKSk7XG4gICAgICAgIHJldHVybiBncm91cGJ5O1xuICAgICAgfSwgc3RhY2tDb21wb25lbnQudHJhbnNmb3JtWzBdLmdyb3VwYnkpO1xuXG4gICAgICBkZWxldGUgY2hpbGREYXRhQ29tcG9uZW50LnN0YWNrU2NhbGU7XG4gICAgICByZXR1cm4gc3RhY2tDb21wb25lbnQ7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTGF5ZXIobW9kZWw6IExheWVyTW9kZWwpIHtcbiAgICAvLyBUT0RPXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gYXNzZW1ibGUoY29tcG9uZW50OiBEYXRhQ29tcG9uZW50KSB7XG4gICAgcmV0dXJuIGNvbXBvbmVudC5zdGFja1NjYWxlO1xuICB9XG59XG4iLCJpbXBvcnQge0FnZ3JlZ2F0ZU9wfSBmcm9tICcuLi8uLi9hZ2dyZWdhdGUnO1xuaW1wb3J0IHtDaGFubmVsfSBmcm9tICcuLi8uLi9jaGFubmVsJztcbmltcG9ydCB7U09VUkNFLCBTVU1NQVJZfSBmcm9tICcuLi8uLi9kYXRhJztcbmltcG9ydCB7ZmllbGQsIEZpZWxkRGVmfSBmcm9tICcuLi8uLi9maWVsZGRlZic7XG5pbXBvcnQge2tleXMsIHZhbHMsIHJlZHVjZSwgaGFzaCwgRGljdCwgU3RyaW5nU2V0fSBmcm9tICcuLi8uLi91dGlsJztcbmltcG9ydCB7VmdEYXRhfSBmcm9tICcuLi8uLi92ZWdhLnNjaGVtYSc7XG5cbmltcG9ydCB7RmFjZXRNb2RlbH0gZnJvbSAnLi8uLi9mYWNldCc7XG5pbXBvcnQge0xheWVyTW9kZWx9IGZyb20gJy4vLi4vbGF5ZXInO1xuaW1wb3J0IHtNb2RlbH0gZnJvbSAnLi8uLi9tb2RlbCc7XG5cbmltcG9ydCB7RGF0YUNvbXBvbmVudCwgU3VtbWFyeUNvbXBvbmVudH0gZnJvbSAnLi9kYXRhJztcblxuXG5leHBvcnQgbmFtZXNwYWNlIHN1bW1hcnkge1xuICBmdW5jdGlvbiBhZGREaW1lbnNpb24oZGltczogeyBbZmllbGQ6IHN0cmluZ106IGJvb2xlYW4gfSwgZmllbGREZWY6IEZpZWxkRGVmKSB7XG4gICAgaWYgKGZpZWxkRGVmLmJpbikge1xuICAgICAgZGltc1tmaWVsZChmaWVsZERlZiwgeyBiaW5TdWZmaXg6ICdfc3RhcnQnIH0pXSA9IHRydWU7XG4gICAgICBkaW1zW2ZpZWxkKGZpZWxkRGVmLCB7IGJpblN1ZmZpeDogJ19taWQnIH0pXSA9IHRydWU7XG4gICAgICBkaW1zW2ZpZWxkKGZpZWxkRGVmLCB7IGJpblN1ZmZpeDogJ19lbmQnIH0pXSA9IHRydWU7XG5cbiAgICAgIC8vIGNvbnN0IHNjYWxlID0gbW9kZWwuc2NhbGUoY2hhbm5lbCk7XG4gICAgICAvLyBpZiAoc2NhbGVUeXBlKHNjYWxlLCBmaWVsZERlZiwgY2hhbm5lbCwgbW9kZWwubWFyaygpKSA9PT0gU2NhbGVUeXBlLk9SRElOQUwpIHtcbiAgICAgIC8vIGFsc28gcHJvZHVjZSBiaW5fcmFuZ2UgaWYgdGhlIGJpbm5lZCBmaWVsZCB1c2Ugb3JkaW5hbCBzY2FsZVxuICAgICAgZGltc1tmaWVsZChmaWVsZERlZiwgeyBiaW5TdWZmaXg6ICdfcmFuZ2UnIH0pXSA9IHRydWU7XG4gICAgICAvLyB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGRpbXNbZmllbGQoZmllbGREZWYpXSA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiBkaW1zO1xuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVW5pdChtb2RlbDogTW9kZWwpOiBTdW1tYXJ5Q29tcG9uZW50W10ge1xuICAgIC8qIHN0cmluZyBzZXQgZm9yIGRpbWVuc2lvbnMgKi9cbiAgICBsZXQgZGltczogU3RyaW5nU2V0ID0ge307XG5cbiAgICAvKiBkaWN0aW9uYXJ5IG1hcHBpbmcgZmllbGQgbmFtZSA9PiBkaWN0IHNldCBvZiBhZ2dyZWdhdGlvbiBmdW5jdGlvbnMgKi9cbiAgICBsZXQgbWVhczogRGljdDxTdHJpbmdTZXQ+ID0ge307XG5cbiAgICBtb2RlbC5mb3JFYWNoKGZ1bmN0aW9uKGZpZWxkRGVmOiBGaWVsZERlZiwgY2hhbm5lbDogQ2hhbm5lbCkge1xuICAgICAgaWYgKGZpZWxkRGVmLmFnZ3JlZ2F0ZSkge1xuICAgICAgICBpZiAoZmllbGREZWYuYWdncmVnYXRlID09PSBBZ2dyZWdhdGVPcC5DT1VOVCkge1xuICAgICAgICAgIG1lYXNbJyonXSA9IG1lYXNbJyonXSB8fCB7fTtcbiAgICAgICAgICAvKiB0c2xpbnQ6ZGlzYWJsZTpuby1zdHJpbmctbGl0ZXJhbCAqL1xuICAgICAgICAgIG1lYXNbJyonXVsnY291bnQnXSA9IHRydWU7XG4gICAgICAgICAgLyogdHNsaW50OmVuYWJsZTpuby1zdHJpbmctbGl0ZXJhbCAqL1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1lYXNbZmllbGREZWYuZmllbGRdID0gbWVhc1tmaWVsZERlZi5maWVsZF0gfHwge307XG4gICAgICAgICAgbWVhc1tmaWVsZERlZi5maWVsZF1bZmllbGREZWYuYWdncmVnYXRlXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFkZERpbWVuc2lvbihkaW1zLCBmaWVsZERlZik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gW3tcbiAgICAgIG5hbWU6IG1vZGVsLmRhdGFOYW1lKFNVTU1BUlkpLFxuICAgICAgZGltZW5zaW9uczogZGltcyxcbiAgICAgIG1lYXN1cmVzOiBtZWFzXG4gICAgfV07XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gcGFyc2VGYWNldChtb2RlbDogRmFjZXRNb2RlbCk6IFN1bW1hcnlDb21wb25lbnRbXSB7XG4gICAgY29uc3QgY2hpbGREYXRhQ29tcG9uZW50ID0gbW9kZWwuY2hpbGQoKS5jb21wb25lbnQuZGF0YTtcblxuICAgIC8vIElmIGNoaWxkIGRvZXNuJ3QgaGF2ZSBpdHMgb3duIGRhdGEgc291cmNlIGJ1dCBoYXMgYSBzdW1tYXJ5IGRhdGEgc291cmNlLCBtZXJnZVxuICAgIGlmICghY2hpbGREYXRhQ29tcG9uZW50LnNvdXJjZSAmJiBjaGlsZERhdGFDb21wb25lbnQuc3VtbWFyeSkge1xuICAgICAgbGV0IHN1bW1hcnlDb21wb25lbnRzID0gY2hpbGREYXRhQ29tcG9uZW50LnN1bW1hcnkubWFwKGZ1bmN0aW9uKHN1bW1hcnlDb21wb25lbnQpIHtcbiAgICAgICAgLy8gYWRkIGZhY2V0IGZpZWxkcyBhcyBkaW1lbnNpb25zXG4gICAgICAgIHN1bW1hcnlDb21wb25lbnQuZGltZW5zaW9ucyA9IG1vZGVsLnJlZHVjZShhZGREaW1lbnNpb24sIHN1bW1hcnlDb21wb25lbnQuZGltZW5zaW9ucyk7XG5cbiAgICAgICAgY29uc3Qgc3VtbWFyeU5hbWVXaXRob3V0UHJlZml4ID0gc3VtbWFyeUNvbXBvbmVudC5uYW1lLnN1YnN0cihtb2RlbC5jaGlsZCgpLm5hbWUoJycpLmxlbmd0aCk7XG4gICAgICAgIG1vZGVsLmNoaWxkKCkucmVuYW1lRGF0YShzdW1tYXJ5Q29tcG9uZW50Lm5hbWUsIHN1bW1hcnlOYW1lV2l0aG91dFByZWZpeCk7XG4gICAgICAgIHN1bW1hcnlDb21wb25lbnQubmFtZSA9IHN1bW1hcnlOYW1lV2l0aG91dFByZWZpeDtcbiAgICAgICAgcmV0dXJuIHN1bW1hcnlDb21wb25lbnQ7XG4gICAgICB9KTtcblxuICAgICAgZGVsZXRlIGNoaWxkRGF0YUNvbXBvbmVudC5zdW1tYXJ5O1xuICAgICAgcmV0dXJuIHN1bW1hcnlDb21wb25lbnRzO1xuICAgIH1cbiAgICByZXR1cm4gW107XG4gIH1cblxuICBmdW5jdGlvbiBtZXJnZU1lYXN1cmVzKHBhcmVudE1lYXN1cmVzOiBEaWN0PERpY3Q8Ym9vbGVhbj4+LCBjaGlsZE1lYXN1cmVzOiBEaWN0PERpY3Q8Ym9vbGVhbj4+KSB7XG4gICAgZm9yIChjb25zdCBmaWVsZCBpbiBjaGlsZE1lYXN1cmVzKSB7XG4gICAgICBpZiAoY2hpbGRNZWFzdXJlcy5oYXNPd25Qcm9wZXJ0eShmaWVsZCkpIHtcbiAgICAgICAgLy8gd2hlbiB3ZSBtZXJnZSBhIG1lYXN1cmUsIHdlIGVpdGhlciBoYXZlIHRvIGFkZCBhbiBhZ2dyZWdhdGlvbiBvcGVyYXRvciBvciBldmVuIGEgbmV3IGZpZWxkXG4gICAgICAgIGNvbnN0IG9wcyA9IGNoaWxkTWVhc3VyZXNbZmllbGRdO1xuICAgICAgICBmb3IgKGNvbnN0IG9wIGluIG9wcykge1xuICAgICAgICAgIGlmIChvcHMuaGFzT3duUHJvcGVydHkob3ApKSB7XG4gICAgICAgICAgICBpZiAoZmllbGQgaW4gcGFyZW50TWVhc3VyZXMpIHtcbiAgICAgICAgICAgICAgLy8gYWRkIG9wZXJhdG9yIHRvIGV4aXN0aW5nIG1lYXN1cmUgZmllbGRcbiAgICAgICAgICAgICAgcGFyZW50TWVhc3VyZXNbZmllbGRdW29wXSA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBwYXJlbnRNZWFzdXJlc1tmaWVsZF0gPSB7IG9wOiB0cnVlIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTGF5ZXIobW9kZWw6IExheWVyTW9kZWwpOiBTdW1tYXJ5Q29tcG9uZW50W10ge1xuICAgIC8vIEluZGV4IGJ5IHRoZSBmaWVsZHMgd2UgYXJlIGdyb3VwaW5nIGJ5XG4gICAgbGV0IHN1bW1hcmllcyA9IHt9IGFzIERpY3Q8U3VtbWFyeUNvbXBvbmVudD47XG5cbiAgICAvLyBDb21iaW5lIHN1bW1hcmllcyBmb3IgY2hpbGRyZW4gdGhhdCBkb24ndCBoYXZlIGEgZGlzdGluY3Qgc291cmNlXG4gICAgLy8gKGVpdGhlciBoYXZpbmcgaXRzIG93biBkYXRhIHNvdXJjZSwgb3IgaXRzIG93biB0cmFuZm9ybWF0aW9uIG9mIHRoZSBzYW1lIGRhdGEgc291cmNlKS5cbiAgICBtb2RlbC5jaGlsZHJlbigpLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgICBjb25zdCBjaGlsZERhdGFDb21wb25lbnQgPSBjaGlsZC5jb21wb25lbnQuZGF0YTtcbiAgICAgIGlmICghY2hpbGREYXRhQ29tcG9uZW50LnNvdXJjZSAmJiBjaGlsZERhdGFDb21wb25lbnQuc3VtbWFyeSkge1xuICAgICAgICAvLyBNZXJnZSB0aGUgc3VtbWFyaWVzIGlmIHdlIGNhblxuICAgICAgICBjaGlsZERhdGFDb21wb25lbnQuc3VtbWFyeS5mb3JFYWNoKChjaGlsZFN1bW1hcnkpID0+IHtcbiAgICAgICAgICAvLyBUaGUga2V5IGlzIGEgaGFzaCBiYXNlZCBvbiB0aGUgZGltZW5zaW9ucztcbiAgICAgICAgICAvLyB3ZSB1c2UgaXQgdG8gZmluZCBvdXQgd2hldGhlciB3ZSBoYXZlIGEgc3VtbWFyeSB0aGF0IHVzZXMgdGhlIHNhbWUgZ3JvdXAgYnkgZmllbGRzLlxuICAgICAgICAgIGNvbnN0IGtleSA9IGhhc2goY2hpbGRTdW1tYXJ5LmRpbWVuc2lvbnMpO1xuICAgICAgICAgIGlmIChrZXkgaW4gc3VtbWFyaWVzKSB7XG4gICAgICAgICAgICAvLyB5ZXMsIHRoZXJlIGlzIGEgc3VtbWFyeSBoYXQgd2UgbmVlZCB0byBtZXJnZSBpbnRvXG4gICAgICAgICAgICAvLyB3ZSBrbm93IHRoYXQgdGhlIGRpbWVuc2lvbnMgYXJlIHRoZSBzYW1lIHNvIHdlIG9ubHkgbmVlZCB0byBtZXJnZSB0aGUgbWVhc3VyZXNcbiAgICAgICAgICAgIG1lcmdlTWVhc3VyZXMoc3VtbWFyaWVzW2tleV0ubWVhc3VyZXMsIGNoaWxkU3VtbWFyeS5tZWFzdXJlcyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGdpdmUgdGhlIHN1bW1hcnkgYSBuZXcgbmFtZVxuICAgICAgICAgICAgY2hpbGRTdW1tYXJ5Lm5hbWUgPSBtb2RlbC5kYXRhTmFtZShTVU1NQVJZKSArICdfJyArIGtleXMoc3VtbWFyaWVzKS5sZW5ndGg7XG4gICAgICAgICAgICBzdW1tYXJpZXNba2V5XSA9IGNoaWxkU3VtbWFyeTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyByZW1vdmUgc3VtbWFyeSBmcm9tIGNoaWxkXG4gICAgICAgICAgY2hpbGQucmVuYW1lRGF0YShjaGlsZC5kYXRhTmFtZShTVU1NQVJZKSwgc3VtbWFyaWVzW2tleV0ubmFtZSk7XG4gICAgICAgICAgZGVsZXRlIGNoaWxkRGF0YUNvbXBvbmVudC5zdW1tYXJ5O1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB2YWxzKHN1bW1hcmllcyk7XG4gIH1cblxuICAvKipcbiAgICogQXNzZW1ibGUgdGhlIHN1bW1hcnkuIE5lZWRzIGEgcmVuYW1lIGZ1bmN0aW9uIGJlY2F1c2Ugd2UgY2Fubm90IGd1YXJhbnRlZSB0aGF0IHRoZVxuICAgKiBwYXJlbnQgZGF0YSBiZWZvcmUgdGhlIGNoaWxkcmVuIGRhdGEuXG4gICAqL1xuICBleHBvcnQgZnVuY3Rpb24gYXNzZW1ibGUoY29tcG9uZW50OiBEYXRhQ29tcG9uZW50LCBtb2RlbDogTW9kZWwpOiBWZ0RhdGFbXSB7XG4gICAgaWYgKCFjb21wb25lbnQuc3VtbWFyeSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICByZXR1cm4gY29tcG9uZW50LnN1bW1hcnkucmVkdWNlKGZ1bmN0aW9uKHN1bW1hcnlEYXRhLCBzdW1tYXJ5Q29tcG9uZW50KSB7XG4gICAgICBjb25zdCBkaW1zID0gc3VtbWFyeUNvbXBvbmVudC5kaW1lbnNpb25zO1xuICAgICAgY29uc3QgbWVhcyA9IHN1bW1hcnlDb21wb25lbnQubWVhc3VyZXM7XG5cbiAgICAgIGNvbnN0IGdyb3VwYnkgPSBrZXlzKGRpbXMpO1xuXG4gICAgICAvLyBzaG9ydC1mb3JtYXQgc3VtbWFyaXplIG9iamVjdCBmb3IgVmVnYSdzIGFnZ3JlZ2F0ZSB0cmFuc2Zvcm1cbiAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS92ZWdhL3ZlZ2Evd2lraS9EYXRhLVRyYW5zZm9ybXMjLWFnZ3JlZ2F0ZVxuICAgICAgY29uc3Qgc3VtbWFyaXplID0gcmVkdWNlKG1lYXMsIGZ1bmN0aW9uKGFnZ3JlZ2F0b3IsIGZuRGljdFNldCwgZmllbGQpIHtcbiAgICAgICAgYWdncmVnYXRvcltmaWVsZF0gPSBrZXlzKGZuRGljdFNldCk7XG4gICAgICAgIHJldHVybiBhZ2dyZWdhdG9yO1xuICAgICAgfSwge30pO1xuXG4gICAgICBpZiAoa2V5cyhtZWFzKS5sZW5ndGggPiAwKSB7IC8vIGhhcyBhZ2dyZWdhdGVcbiAgICAgICAgc3VtbWFyeURhdGEucHVzaCh7XG4gICAgICAgICAgbmFtZTogc3VtbWFyeUNvbXBvbmVudC5uYW1lLFxuICAgICAgICAgIHNvdXJjZTogbW9kZWwuZGF0YU5hbWUoU09VUkNFKSxcbiAgICAgICAgICB0cmFuc2Zvcm06IFt7XG4gICAgICAgICAgICB0eXBlOiAnYWdncmVnYXRlJyxcbiAgICAgICAgICAgIGdyb3VwYnk6IGdyb3VwYnksXG4gICAgICAgICAgICBzdW1tYXJpemU6IHN1bW1hcml6ZVxuICAgICAgICAgIH1dXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN1bW1hcnlEYXRhO1xuICAgIH0sIFtdKTtcbiAgfVxufVxuIiwiaW1wb3J0IHtDaGFubmVsfSBmcm9tICcuLi8uLi9jaGFubmVsJztcbmltcG9ydCB7ZmllbGQsIEZpZWxkRGVmfSBmcm9tICcuLi8uLi9maWVsZGRlZic7XG5pbXBvcnQge1RFTVBPUkFMfSBmcm9tICcuLi8uLi90eXBlJztcbmltcG9ydCB7ZXh0ZW5kLCB2YWxzLCBEaWN0fSBmcm9tICcuLi8uLi91dGlsJztcbmltcG9ydCB7VmdUcmFuc2Zvcm19IGZyb20gJy4uLy4uL3ZlZ2Euc2NoZW1hJztcblxuaW1wb3J0IHtGYWNldE1vZGVsfSBmcm9tICcuLy4uL2ZhY2V0JztcbmltcG9ydCB7TGF5ZXJNb2RlbH0gZnJvbSAnLi8uLi9sYXllcic7XG5pbXBvcnQge01vZGVsfSBmcm9tICcuLy4uL21vZGVsJztcbmltcG9ydCB7cGFyc2VFeHByZXNzaW9ufSBmcm9tICcuLy4uL3RpbWUnO1xuXG5pbXBvcnQge0RhdGFDb21wb25lbnR9IGZyb20gJy4vZGF0YSc7XG5cblxuZXhwb3J0IG5hbWVzcGFjZSB0aW1lVW5pdCB7XG4gIGZ1bmN0aW9uIHBhcnNlKG1vZGVsOiBNb2RlbCk6IERpY3Q8VmdUcmFuc2Zvcm0+IHtcbiAgICByZXR1cm4gbW9kZWwucmVkdWNlKGZ1bmN0aW9uKHRpbWVVbml0Q29tcG9uZW50LCBmaWVsZERlZjogRmllbGREZWYsIGNoYW5uZWw6IENoYW5uZWwpIHtcbiAgICAgIGNvbnN0IHJlZiA9IGZpZWxkKGZpZWxkRGVmLCB7IG5vZm46IHRydWUsIGRhdHVtOiB0cnVlIH0pO1xuICAgICAgaWYgKGZpZWxkRGVmLnR5cGUgPT09IFRFTVBPUkFMICYmIGZpZWxkRGVmLnRpbWVVbml0KSB7XG5cbiAgICAgICAgY29uc3QgaGFzaCA9IGZpZWxkKGZpZWxkRGVmKTtcblxuICAgICAgICB0aW1lVW5pdENvbXBvbmVudFtoYXNoXSA9IHtcbiAgICAgICAgICB0eXBlOiAnZm9ybXVsYScsXG4gICAgICAgICAgZmllbGQ6IGZpZWxkKGZpZWxkRGVmKSxcbiAgICAgICAgICBleHByOiBwYXJzZUV4cHJlc3Npb24oZmllbGREZWYudGltZVVuaXQsIHJlZilcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aW1lVW5pdENvbXBvbmVudDtcbiAgICB9LCB7fSk7XG4gIH1cblxuICBleHBvcnQgY29uc3QgcGFyc2VVbml0ID0gcGFyc2U7XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRmFjZXQobW9kZWw6IEZhY2V0TW9kZWwpIHtcbiAgICBsZXQgdGltZVVuaXRDb21wb25lbnQgPSBwYXJzZShtb2RlbCk7XG5cbiAgICBjb25zdCBjaGlsZERhdGFDb21wb25lbnQgPSBtb2RlbC5jaGlsZCgpLmNvbXBvbmVudC5kYXRhO1xuXG4gICAgLy8gSWYgY2hpbGQgZG9lc24ndCBoYXZlIGl0cyBvd24gZGF0YSBzb3VyY2UsIHRoZW4gbWVyZ2VcbiAgICBpZiAoIWNoaWxkRGF0YUNvbXBvbmVudC5zb3VyY2UpIHtcbiAgICAgIGV4dGVuZCh0aW1lVW5pdENvbXBvbmVudCwgY2hpbGREYXRhQ29tcG9uZW50LnRpbWVVbml0KTtcbiAgICAgIGRlbGV0ZSBjaGlsZERhdGFDb21wb25lbnQudGltZVVuaXQ7XG4gICAgfVxuICAgIHJldHVybiB0aW1lVW5pdENvbXBvbmVudDtcbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiBwYXJzZUxheWVyKG1vZGVsOiBMYXllck1vZGVsKSB7XG4gICAgbGV0IHRpbWVVbml0Q29tcG9uZW50ID0gcGFyc2UobW9kZWwpO1xuICAgIG1vZGVsLmNoaWxkcmVuKCkuZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgIGNvbnN0IGNoaWxkRGF0YUNvbXBvbmVudCA9IGNoaWxkLmNvbXBvbmVudC5kYXRhO1xuICAgICAgaWYgKCFjaGlsZERhdGFDb21wb25lbnQuc291cmNlKSB7XG4gICAgICAgIGV4dGVuZCh0aW1lVW5pdENvbXBvbmVudCwgY2hpbGREYXRhQ29tcG9uZW50LnRpbWVVbml0KTtcbiAgICAgICAgZGVsZXRlIGNoaWxkRGF0YUNvbXBvbmVudC50aW1lVW5pdDtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gdGltZVVuaXRDb21wb25lbnQ7XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gYXNzZW1ibGUoY29tcG9uZW50OiBEYXRhQ29tcG9uZW50KSB7XG4gICAgLy8ganVzdCBqb2luIHRoZSB2YWx1ZXMsIHdoaWNoIGFyZSBhbHJlYWR5IHRyYW5zZm9ybXNcbiAgICByZXR1cm4gdmFscyhjb21wb25lbnQudGltZVVuaXQpO1xuICB9XG59XG4iLCJpbXBvcnQge0NoYW5uZWx9IGZyb20gJy4uLy4uL2NoYW5uZWwnO1xuaW1wb3J0IHtGaWVsZERlZn0gZnJvbSAnLi4vLi4vZmllbGRkZWYnO1xuaW1wb3J0IHtUaW1lVW5pdH0gZnJvbSAnLi4vLi4vdGltZXVuaXQnO1xuaW1wb3J0IHtleHRlbmQsIGtleXMsIFN0cmluZ1NldH0gZnJvbSAnLi4vLi4vdXRpbCc7XG5pbXBvcnQge1ZnRGF0YX0gZnJvbSAnLi4vLi4vdmVnYS5zY2hlbWEnO1xuXG5pbXBvcnQge0ZhY2V0TW9kZWx9IGZyb20gJy4vLi4vZmFjZXQnO1xuaW1wb3J0IHtMYXllck1vZGVsfSBmcm9tICcuLy4uL2xheWVyJztcbmltcG9ydCB7TW9kZWx9IGZyb20gJy4vLi4vbW9kZWwnO1xuaW1wb3J0IHtwYXJzZUV4cHJlc3Npb24sIHJhd0RvbWFpbn0gZnJvbSAnLi8uLi90aW1lJztcblxuaW1wb3J0IHtEYXRhQ29tcG9uZW50fSBmcm9tICcuL2RhdGEnO1xuXG5cbmV4cG9ydCBuYW1lc3BhY2UgdGltZVVuaXREb21haW4ge1xuICBmdW5jdGlvbiBwYXJzZShtb2RlbDogTW9kZWwpOiBTdHJpbmdTZXQge1xuICAgIHJldHVybiBtb2RlbC5yZWR1Y2UoZnVuY3Rpb24odGltZVVuaXREb21haW5NYXAsIGZpZWxkRGVmOiBGaWVsZERlZiwgY2hhbm5lbDogQ2hhbm5lbCkge1xuICAgICAgaWYgKGZpZWxkRGVmLnRpbWVVbml0KSB7XG4gICAgICAgIGNvbnN0IGRvbWFpbiA9IHJhd0RvbWFpbihmaWVsZERlZi50aW1lVW5pdCwgY2hhbm5lbCk7XG4gICAgICAgIGlmIChkb21haW4pIHtcbiAgICAgICAgICB0aW1lVW5pdERvbWFpbk1hcFtmaWVsZERlZi50aW1lVW5pdF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGltZVVuaXREb21haW5NYXA7XG4gICAgfSwge30pO1xuICB9XG5cbiAgZXhwb3J0IGNvbnN0IHBhcnNlVW5pdCA9IHBhcnNlO1xuXG4gIGV4cG9ydCBmdW5jdGlvbiBwYXJzZUZhY2V0KG1vZGVsOiBGYWNldE1vZGVsKSB7XG4gICAgLy8gYWx3YXlzIG1lcmdlIHdpdGggY2hpbGRcbiAgICByZXR1cm4gZXh0ZW5kKHBhcnNlKG1vZGVsKSwgbW9kZWwuY2hpbGQoKS5jb21wb25lbnQuZGF0YS50aW1lVW5pdERvbWFpbik7XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gcGFyc2VMYXllcihtb2RlbDogTGF5ZXJNb2RlbCkge1xuICAgIC8vIGFsd2F5cyBtZXJnZSB3aXRoIGNoaWxkcmVuXG4gICAgcmV0dXJuIGV4dGVuZChwYXJzZShtb2RlbCksIG1vZGVsLmNoaWxkcmVuKCkuZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgIHJldHVybiBjaGlsZC5jb21wb25lbnQuZGF0YS50aW1lVW5pdERvbWFpbjtcbiAgICB9KSk7XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gYXNzZW1ibGUoY29tcG9uZW50OiBEYXRhQ29tcG9uZW50KTogVmdEYXRhW10ge1xuICAgIHJldHVybiBrZXlzKGNvbXBvbmVudC50aW1lVW5pdERvbWFpbikucmVkdWNlKGZ1bmN0aW9uKHRpbWVVbml0RGF0YSwgdHU6IGFueSkge1xuICAgICAgY29uc3QgdGltZVVuaXQ6IFRpbWVVbml0ID0gdHU7IC8vIGNhc3Qgc3RyaW5nIGJhY2sgdG8gZW51bVxuICAgICAgY29uc3QgZG9tYWluID0gcmF3RG9tYWluKHRpbWVVbml0LCBudWxsKTsgLy8gRklYTUUgZml4IHJhd0RvbWFpbiBzaWduYXR1cmVcbiAgICAgIGlmIChkb21haW4pIHtcbiAgICAgICAgdGltZVVuaXREYXRhLnB1c2goe1xuICAgICAgICAgIG5hbWU6IHRpbWVVbml0LFxuICAgICAgICAgIHZhbHVlczogZG9tYWluLFxuICAgICAgICAgIHRyYW5zZm9ybTogW3tcbiAgICAgICAgICAgIHR5cGU6ICdmb3JtdWxhJyxcbiAgICAgICAgICAgIGZpZWxkOiAnZGF0ZScsXG4gICAgICAgICAgICBleHByOiBwYXJzZUV4cHJlc3Npb24odGltZVVuaXQsICdkYXR1bS5kYXRhJywgdHJ1ZSlcbiAgICAgICAgICB9XVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aW1lVW5pdERhdGE7XG4gICAgfSwgW10pO1xuICB9XG59XG4iLCJpbXBvcnQge0F4aXNPcmllbnQsIEF4aXN9IGZyb20gJy4uL2F4aXMnO1xuaW1wb3J0IHtDT0xVTU4sIFJPVywgWCwgWSwgQ2hhbm5lbH0gZnJvbSAnLi4vY2hhbm5lbCc7XG5pbXBvcnQge2RlZmF1bHRDb25maWcsIENvbmZpZ30gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCB7U09VUkNFLCBTVU1NQVJZfSBmcm9tICcuLi9kYXRhJztcbmltcG9ydCB7RmFjZXR9IGZyb20gJy4uL2ZhY2V0JztcbmltcG9ydCB7Y2hhbm5lbE1hcHBpbmdGb3JFYWNofSBmcm9tICcuLi9lbmNvZGluZyc7XG5pbXBvcnQge0ZpZWxkRGVmLCBpc0RpbWVuc2lvbn0gZnJvbSAnLi4vZmllbGRkZWYnO1xuaW1wb3J0IHtTY2FsZSwgU2NhbGVUeXBlfSBmcm9tICcuLi9zY2FsZSc7XG5pbXBvcnQge0ZhY2V0U3BlY30gZnJvbSAnLi4vc3BlYyc7XG5pbXBvcnQge2dldEZ1bGxOYW1lfSBmcm9tICcuLi90eXBlJztcbmltcG9ydCB7ZXh0ZW5kLCBrZXlzLCB2YWxzLCBmbGF0dGVuLCBkdXBsaWNhdGUsIG1lcmdlRGVlcCwgRGljdH0gZnJvbSAnLi4vdXRpbCc7XG5pbXBvcnQge1ZnRGF0YSwgVmdNYXJrR3JvdXB9IGZyb20gJy4uL3ZlZ2Euc2NoZW1hJztcblxuaW1wb3J0IHtwYXJzZUF4aXMsIHBhcnNlSW5uZXJBeGlzLCBncmlkU2hvdywgcGFyc2VBeGlzQ29tcG9uZW50fSBmcm9tICcuL2F4aXMnO1xuaW1wb3J0IHtidWlsZE1vZGVsfSBmcm9tICcuL2NvbW1vbic7XG5pbXBvcnQge2Fzc2VtYmxlRGF0YSwgcGFyc2VGYWNldERhdGF9IGZyb20gJy4vZGF0YS9kYXRhJztcbmltcG9ydCB7YXNzZW1ibGVMYXlvdXQsIHBhcnNlRmFjZXRMYXlvdXR9IGZyb20gJy4vbGF5b3V0JztcbmltcG9ydCB7TW9kZWx9IGZyb20gJy4vbW9kZWwnO1xuaW1wb3J0IHtwYXJzZVNjYWxlQ29tcG9uZW50fSBmcm9tICcuL3NjYWxlJztcblxuZXhwb3J0IGNsYXNzIEZhY2V0TW9kZWwgZXh0ZW5kcyBNb2RlbCB7XG4gIHByaXZhdGUgX2ZhY2V0OiBGYWNldDtcblxuICBwcml2YXRlIF9jaGlsZDogTW9kZWw7XG5cbiAgY29uc3RydWN0b3Ioc3BlYzogRmFjZXRTcGVjLCBwYXJlbnQ6IE1vZGVsLCBwYXJlbnRHaXZlbk5hbWU6IHN0cmluZykge1xuICAgIHN1cGVyKHNwZWMsIHBhcmVudCwgcGFyZW50R2l2ZW5OYW1lKTtcblxuICAgIC8vIENvbmZpZyBtdXN0IGJlIGluaXRpYWxpemVkIGJlZm9yZSBjaGlsZCBhcyBpdCBnZXRzIGNhc2NhZGVkIHRvIHRoZSBjaGlsZFxuICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMuX2NvbmZpZyA9IHRoaXMuX2luaXRDb25maWcoc3BlYy5jb25maWcsIHBhcmVudCk7XG5cbiAgICBjb25zdCBjaGlsZCAgPSB0aGlzLl9jaGlsZCA9IGJ1aWxkTW9kZWwoc3BlYy5zcGVjLCB0aGlzLCB0aGlzLm5hbWUoJ2NoaWxkJykpO1xuXG4gICAgY29uc3QgZmFjZXQgID0gdGhpcy5fZmFjZXQgPSB0aGlzLl9pbml0RmFjZXQoc3BlYy5mYWNldCk7XG4gICAgdGhpcy5fc2NhbGUgID0gdGhpcy5faW5pdFNjYWxlKGZhY2V0LCBjb25maWcsIGNoaWxkKTtcbiAgICB0aGlzLl9heGlzICAgPSB0aGlzLl9pbml0QXhpcyhmYWNldCwgY29uZmlnLCBjaGlsZCk7XG4gIH1cblxuICBwcml2YXRlIF9pbml0Q29uZmlnKHNwZWNDb25maWc6IENvbmZpZywgcGFyZW50OiBNb2RlbCkge1xuICAgIHJldHVybiBtZXJnZURlZXAoZHVwbGljYXRlKGRlZmF1bHRDb25maWcpLCBzcGVjQ29uZmlnLCBwYXJlbnQgPyBwYXJlbnQuY29uZmlnKCkgOiB7fSk7XG4gIH1cblxuICBwcml2YXRlIF9pbml0RmFjZXQoZmFjZXQ6IEZhY2V0KSB7XG4gICAgLy8gY2xvbmUgdG8gcHJldmVudCBzaWRlIGVmZmVjdCB0byB0aGUgb3JpZ2luYWwgc3BlY1xuICAgIGZhY2V0ID0gZHVwbGljYXRlKGZhY2V0KTtcblxuICAgIGNvbnN0IG1vZGVsID0gdGhpcztcblxuICAgIGNoYW5uZWxNYXBwaW5nRm9yRWFjaCh0aGlzLmNoYW5uZWxzKCksIGZhY2V0LCBmdW5jdGlvbihmaWVsZERlZjogRmllbGREZWYsIGNoYW5uZWw6IENoYW5uZWwpIHtcbiAgICAgIC8vIFRPRE86IGlmIGhhcyBubyBmaWVsZCAvIGRhdHVtLCB0aGVuIGRyb3AgdGhlIGZpZWxkXG5cbiAgICAgIGlmICghaXNEaW1lbnNpb24oZmllbGREZWYpKSB7XG4gICAgICAgIG1vZGVsLmFkZFdhcm5pbmcoY2hhbm5lbCArICcgZW5jb2Rpbmcgc2hvdWxkIGJlIG9yZGluYWwuJyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChmaWVsZERlZi50eXBlKSB7XG4gICAgICAgIC8vIGNvbnZlcnQgc2hvcnQgdHlwZSB0byBmdWxsIHR5cGVcbiAgICAgICAgZmllbGREZWYudHlwZSA9IGdldEZ1bGxOYW1lKGZpZWxkRGVmLnR5cGUpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBmYWNldDtcbiAgfVxuXG4gIHByaXZhdGUgX2luaXRTY2FsZShmYWNldDogRmFjZXQsIGNvbmZpZzogQ29uZmlnLCBjaGlsZDogTW9kZWwpOiBEaWN0PFNjYWxlPiB7XG4gICAgcmV0dXJuIFtST1csIENPTFVNTl0ucmVkdWNlKGZ1bmN0aW9uKF9zY2FsZSwgY2hhbm5lbCkge1xuICAgICAgaWYgKGZhY2V0W2NoYW5uZWxdKSB7XG5cbiAgICAgICAgY29uc3Qgc2NhbGVTcGVjID0gZmFjZXRbY2hhbm5lbF0uc2NhbGUgfHwge307XG4gICAgICAgIF9zY2FsZVtjaGFubmVsXSA9IGV4dGVuZCh7XG4gICAgICAgICAgdHlwZTogU2NhbGVUeXBlLk9SRElOQUwsXG4gICAgICAgICAgcm91bmQ6IGNvbmZpZy5mYWNldC5zY2FsZS5yb3VuZCxcblxuICAgICAgICAgIC8vIFRPRE86IHJldmlzZSB0aGlzIHJ1bGUgZm9yIG11bHRpcGxlIGxldmVsIG9mIG5lc3RpbmdcbiAgICAgICAgICBwYWRkaW5nOiAoY2hhbm5lbCA9PT0gUk9XICYmIGNoaWxkLmhhcyhZKSkgfHwgKGNoYW5uZWwgPT09IENPTFVNTiAmJiBjaGlsZC5oYXMoWCkpID9cbiAgICAgICAgICAgICAgICAgICBjb25maWcuZmFjZXQuc2NhbGUucGFkZGluZyA6IDBcbiAgICAgICAgfSwgc2NhbGVTcGVjKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfc2NhbGU7XG4gICAgfSwge30gYXMgRGljdDxTY2FsZT4pO1xuICB9XG5cbiAgcHJpdmF0ZSBfaW5pdEF4aXMoZmFjZXQ6IEZhY2V0LCBjb25maWc6IENvbmZpZywgY2hpbGQ6IE1vZGVsKTogRGljdDxBeGlzPiB7XG4gICAgcmV0dXJuIFtST1csIENPTFVNTl0ucmVkdWNlKGZ1bmN0aW9uKF9heGlzLCBjaGFubmVsKSB7XG4gICAgICBpZiAoZmFjZXRbY2hhbm5lbF0pIHtcbiAgICAgICAgY29uc3QgYXhpc1NwZWMgPSBmYWNldFtjaGFubmVsXS5heGlzO1xuICAgICAgICBpZiAoYXhpc1NwZWMgIT09IGZhbHNlKSB7XG4gICAgICAgICAgY29uc3QgbW9kZWxBeGlzID0gX2F4aXNbY2hhbm5lbF0gPSBleHRlbmQoe30sXG4gICAgICAgICAgICBjb25maWcuZmFjZXQuYXhpcyxcbiAgICAgICAgICAgIGF4aXNTcGVjID09PSB0cnVlID8ge30gOiBheGlzU3BlYyB8fCB7fVxuICAgICAgICAgICk7XG5cbiAgICAgICAgICBpZiAoY2hhbm5lbCA9PT0gUk9XKSB7XG4gICAgICAgICAgICBjb25zdCB5QXhpczogYW55ID0gY2hpbGQuYXhpcyhZKTtcbiAgICAgICAgICAgIGlmICh5QXhpcyAmJiB5QXhpcy5vcmllbnQgIT09IEF4aXNPcmllbnQuUklHSFQgJiYgIW1vZGVsQXhpcy5vcmllbnQpIHtcbiAgICAgICAgICAgICAgbW9kZWxBeGlzLm9yaWVudCA9IEF4aXNPcmllbnQuUklHSFQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiggY2hpbGQuaGFzKFgpICYmICFtb2RlbEF4aXMubGFiZWxBbmdsZSkge1xuICAgICAgICAgICAgICBtb2RlbEF4aXMubGFiZWxBbmdsZSA9IG1vZGVsQXhpcy5vcmllbnQgPT09IEF4aXNPcmllbnQuUklHSFQgPyA5MCA6IDI3MDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBfYXhpcztcbiAgICB9LCB7fSBhcyBEaWN0PEF4aXM+KTtcbiAgfVxuXG4gIHB1YmxpYyBmYWNldCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZmFjZXQ7XG4gIH1cblxuICBwdWJsaWMgaGFzKGNoYW5uZWw6IENoYW5uZWwpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISF0aGlzLl9mYWNldFtjaGFubmVsXTtcbiAgfVxuXG4gIHB1YmxpYyBjaGlsZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fY2hpbGQ7XG4gIH1cblxuICBwcml2YXRlIGhhc1N1bW1hcnkoKSB7XG4gICAgY29uc3Qgc3VtbWFyeSA9IHRoaXMuY29tcG9uZW50LmRhdGEuc3VtbWFyeTtcbiAgICBmb3IgKGxldCBpID0gMCA7IGkgPCBzdW1tYXJ5Lmxlbmd0aCA7IGkrKykge1xuICAgICAgaWYgKGtleXMoc3VtbWFyeVtpXS5tZWFzdXJlcykubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcHVibGljIGRhdGFUYWJsZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiAodGhpcy5oYXNTdW1tYXJ5KCkgPyBTVU1NQVJZIDogU09VUkNFKSArICcnO1xuICB9XG5cbiAgcHVibGljIGZpZWxkRGVmKGNoYW5uZWw6IENoYW5uZWwpOiBGaWVsZERlZiB7XG4gICAgcmV0dXJuIHRoaXMuZmFjZXQoKVtjaGFubmVsXTtcbiAgfVxuXG4gIHB1YmxpYyBzdGFjaygpIHtcbiAgICByZXR1cm4gbnVsbDsgLy8gdGhpcyBpcyBvbmx5IGEgcHJvcGVydHkgZm9yIFVuaXRNb2RlbFxuICB9XG5cbiAgcHVibGljIHBhcnNlRGF0YSgpIHtcbiAgICB0aGlzLmNoaWxkKCkucGFyc2VEYXRhKCk7XG4gICAgdGhpcy5jb21wb25lbnQuZGF0YSA9IHBhcnNlRmFjZXREYXRhKHRoaXMpO1xuICB9XG5cbiAgcHVibGljIHBhcnNlU2VsZWN0aW9uRGF0YSgpIHtcbiAgICAvLyBUT0RPOiBAYXJ2aW5kIGNhbiB3cml0ZSB0aGlzXG4gICAgLy8gV2UgbWlnaHQgbmVlZCB0byBzcGxpdCB0aGlzIGludG8gY29tcGlsZVNlbGVjdGlvbkRhdGEgYW5kIGNvbXBpbGVTZWxlY3Rpb25TaWduYWxzP1xuICB9XG5cbiAgcHVibGljIHBhcnNlTGF5b3V0RGF0YSgpIHtcbiAgICB0aGlzLmNoaWxkKCkucGFyc2VMYXlvdXREYXRhKCk7XG4gICAgdGhpcy5jb21wb25lbnQubGF5b3V0ID0gcGFyc2VGYWNldExheW91dCh0aGlzKTtcbiAgfVxuXG4gIHB1YmxpYyBwYXJzZVNjYWxlKCkge1xuICAgIGNvbnN0IGNoaWxkID0gdGhpcy5jaGlsZCgpO1xuICAgIGNvbnN0IG1vZGVsID0gdGhpcztcblxuICAgIGNoaWxkLnBhcnNlU2NhbGUoKTtcblxuICAgIC8vIFRPRE86IHN1cHBvcnQgc2NhbGVzIGZvciBmaWVsZCByZWZlcmVuY2Ugb2YgcGFyZW50IGRhdGEgKGUuZy4sIGZvciBTUExPTSlcblxuICAgIC8vIEZpcnN0LCBhZGQgc2NhbGUgZm9yIHJvdyBhbmQgY29sdW1uLlxuICAgIGxldCBzY2FsZUNvbXBvbmVudCA9IHRoaXMuY29tcG9uZW50LnNjYWxlID0gcGFyc2VTY2FsZUNvbXBvbmVudCh0aGlzKTtcblxuICAgIC8vIFRoZW4sIG1vdmUgc2hhcmVkL3VuaW9uIGZyb20gaXRzIGNoaWxkIHNwZWMuXG4gICAga2V5cyhjaGlsZC5jb21wb25lbnQuc2NhbGUpLmZvckVhY2goZnVuY3Rpb24oY2hhbm5lbCkge1xuICAgICAgLy8gVE9ETzogY29ycmVjdGx5IGltcGxlbWVudCBpbmRlcGVuZGVudCBzY2FsZVxuICAgICAgaWYgKHRydWUpIHsgLy8gaWYgc2hhcmVkL3VuaW9uIHNjYWxlXG4gICAgICAgIHNjYWxlQ29tcG9uZW50W2NoYW5uZWxdID0gY2hpbGQuY29tcG9uZW50LnNjYWxlW2NoYW5uZWxdO1xuXG4gICAgICAgIC8vIGZvciBlYWNoIHNjYWxlLCBuZWVkIHRvIHJlbmFtZVxuICAgICAgICB2YWxzKHNjYWxlQ29tcG9uZW50W2NoYW5uZWxdKS5mb3JFYWNoKGZ1bmN0aW9uKHNjYWxlKSB7XG4gICAgICAgICAgY29uc3Qgc2NhbGVOYW1lV2l0aG91dFByZWZpeCA9IHNjYWxlLm5hbWUuc3Vic3RyKGNoaWxkLm5hbWUoJycpLmxlbmd0aCk7XG4gICAgICAgICAgY29uc3QgbmV3TmFtZSA9IG1vZGVsLnNjYWxlTmFtZShzY2FsZU5hbWVXaXRob3V0UHJlZml4KTtcbiAgICAgICAgICBjaGlsZC5yZW5hbWVTY2FsZShzY2FsZS5uYW1lLCBuZXdOYW1lKTtcbiAgICAgICAgICBzY2FsZS5uYW1lID0gbmV3TmFtZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gT25jZSBwdXQgaW4gcGFyZW50LCBqdXN0IHJlbW92ZSB0aGUgY2hpbGQncyBzY2FsZS5cbiAgICAgICAgZGVsZXRlIGNoaWxkLmNvbXBvbmVudC5zY2FsZVtjaGFubmVsXTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBwYXJzZU1hcmsoKSB7XG4gICAgdGhpcy5jaGlsZCgpLnBhcnNlTWFyaygpO1xuXG4gICAgdGhpcy5jb21wb25lbnQubWFyayA9IGV4dGVuZChcbiAgICAgIHtcbiAgICAgICAgbmFtZTogdGhpcy5uYW1lKCdjZWxsJyksXG4gICAgICAgIHR5cGU6ICdncm91cCcsXG4gICAgICAgIGZyb206IGV4dGVuZChcbiAgICAgICAgICB0aGlzLmRhdGFUYWJsZSgpID8ge2RhdGE6IHRoaXMuZGF0YVRhYmxlKCl9IDoge30sXG4gICAgICAgICAge1xuICAgICAgICAgICAgdHJhbnNmb3JtOiBbe1xuICAgICAgICAgICAgICB0eXBlOiAnZmFjZXQnLFxuICAgICAgICAgICAgICBncm91cGJ5OiBbXS5jb25jYXQoXG4gICAgICAgICAgICAgICAgdGhpcy5oYXMoUk9XKSA/IFt0aGlzLmZpZWxkKFJPVyldIDogW10sXG4gICAgICAgICAgICAgICAgdGhpcy5oYXMoQ09MVU1OKSA/IFt0aGlzLmZpZWxkKENPTFVNTildIDogW11cbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfV1cbiAgICAgICAgICB9XG4gICAgICAgICksXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICB1cGRhdGU6IGdldEZhY2V0R3JvdXBQcm9wZXJ0aWVzKHRoaXMpXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAvLyBDYWxsIGNoaWxkJ3MgYXNzZW1ibGVHcm91cCB0byBhZGQgbWFya3MsIHNjYWxlcywgYXhlcywgYW5kIGxlZ2VuZHMuXG4gICAgICAvLyBOb3RlIHRoYXQgd2UgY2FuIGNhbGwgY2hpbGQncyBhc3NlbWJsZUdyb3VwKCkgaGVyZSBiZWNhdXNlIHBhcnNlTWFyaygpXG4gICAgICAvLyBpcyB0aGUgbGFzdCBtZXRob2QgaW4gY29tcGlsZSgpIGFuZCB0aHVzIHRoZSBjaGlsZCBpcyBjb21wbGV0ZWx5IGNvbXBpbGVkXG4gICAgICAvLyBhdCB0aGlzIHBvaW50LlxuICAgICAgdGhpcy5jaGlsZCgpLmFzc2VtYmxlR3JvdXAoKVxuICAgICk7XG4gIH1cblxuICBwdWJsaWMgcGFyc2VBeGlzKCkge1xuICAgIHRoaXMuY2hpbGQoKS5wYXJzZUF4aXMoKTtcbiAgICB0aGlzLmNvbXBvbmVudC5heGlzID0gcGFyc2VBeGlzQ29tcG9uZW50KHRoaXMsIFtST1csIENPTFVNTl0pO1xuICB9XG5cbiAgcHVibGljIHBhcnNlQXhpc0dyb3VwKCkge1xuICAgIC8vIFRPRE86IHdpdGggbmVzdGluZywgd2UgbWlnaHQgbmVlZCB0byBjb25zaWRlciBjYWxsaW5nIGNoaWxkXG4gICAgLy8gdGhpcy5jaGlsZCgpLnBhcnNlQXhpc0dyb3VwKCk7XG5cbiAgICBjb25zdCB4QXhpc0dyb3VwID0gcGFyc2VBeGlzR3JvdXAodGhpcywgWCk7XG4gICAgY29uc3QgeUF4aXNHcm91cCA9IHBhcnNlQXhpc0dyb3VwKHRoaXMsIFkpO1xuXG4gICAgdGhpcy5jb21wb25lbnQuYXhpc0dyb3VwID0gZXh0ZW5kKFxuICAgICAgeEF4aXNHcm91cCA/IHt4OiB4QXhpc0dyb3VwfSA6IHt9LFxuICAgICAgeUF4aXNHcm91cCA/IHt5OiB5QXhpc0dyb3VwfSA6IHt9XG4gICAgKTtcbiAgfVxuXG4gIHB1YmxpYyBwYXJzZUdyaWRHcm91cCgpIHtcbiAgICAvLyBUT0RPOiB3aXRoIG5lc3RpbmcsIHdlIG1pZ2h0IG5lZWQgdG8gY29uc2lkZXIgY2FsbGluZyBjaGlsZFxuICAgIC8vIHRoaXMuY2hpbGQoKS5wYXJzZUdyaWRHcm91cCgpO1xuXG4gICAgY29uc3QgY2hpbGQgPSB0aGlzLmNoaWxkKCk7XG5cbiAgICB0aGlzLmNvbXBvbmVudC5ncmlkR3JvdXAgPSBleHRlbmQoXG4gICAgICAhY2hpbGQuaGFzKFgpICYmIHRoaXMuaGFzKENPTFVNTikgPyB7IGNvbHVtbjogZ2V0Q29sdW1uR3JpZEdyb3Vwcyh0aGlzKSB9IDoge30sXG4gICAgICAhY2hpbGQuaGFzKFkpICYmIHRoaXMuaGFzKFJPVykgPyB7IHJvdzogZ2V0Um93R3JpZEdyb3Vwcyh0aGlzKSB9IDoge31cbiAgICApO1xuICB9XG5cbiAgcHVibGljIHBhcnNlTGVnZW5kKCkge1xuICAgIHRoaXMuY2hpbGQoKS5wYXJzZUxlZ2VuZCgpO1xuXG4gICAgLy8gVE9ETzogc3VwcG9ydCBsZWdlbmQgZm9yIGluZGVwZW5kZW50IG5vbi1wb3NpdGlvbiBzY2FsZSBhY3Jvc3MgZmFjZXRzXG4gICAgLy8gVE9ETzogc3VwcG9ydCBsZWdlbmQgZm9yIGZpZWxkIHJlZmVyZW5jZSBvZiBwYXJlbnQgZGF0YSAoZS5nLiwgZm9yIFNQTE9NKVxuXG4gICAgLy8gRm9yIG5vdywgYXNzdW1pbmcgdGhhdCBub24tcG9zaXRpb25hbCBzY2FsZXMgYXJlIGFsd2F5cyBzaGFyZWQgYWNyb3NzIGZhY2V0c1xuICAgIC8vIFRodXMsIGp1c3QgbW92ZSBhbGwgbGVnZW5kcyBmcm9tIGl0cyBjaGlsZFxuICAgIHRoaXMuY29tcG9uZW50LmxlZ2VuZCA9IHRoaXMuX2NoaWxkLmNvbXBvbmVudC5sZWdlbmQ7XG4gICAgdGhpcy5fY2hpbGQuY29tcG9uZW50LmxlZ2VuZCA9IHt9O1xuICB9XG5cbiAgcHVibGljIGFzc2VtYmxlUGFyZW50R3JvdXBQcm9wZXJ0aWVzKCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHVibGljIGFzc2VtYmxlRGF0YShkYXRhOiBWZ0RhdGFbXSk6IFZnRGF0YVtdIHtcbiAgICAvLyBQcmVmaXggdHJhdmVyc2FsIOKAkyBwYXJlbnQgZGF0YSBtaWdodCBiZSByZWZlcnJlZCBieSBjaGlsZHJlbiBkYXRhXG4gICAgYXNzZW1ibGVEYXRhKHRoaXMsIGRhdGEpO1xuICAgIHJldHVybiB0aGlzLl9jaGlsZC5hc3NlbWJsZURhdGEoZGF0YSk7XG4gIH1cblxuICBwdWJsaWMgYXNzZW1ibGVMYXlvdXQobGF5b3V0RGF0YTogVmdEYXRhW10pOiBWZ0RhdGFbXSB7XG4gICAgLy8gUG9zdGZpeCB0cmF2ZXJzYWwg4oCTIGxheW91dCBpcyBhc3NlbWJsZWQgYm90dG9tLXVwXG4gICAgdGhpcy5fY2hpbGQuYXNzZW1ibGVMYXlvdXQobGF5b3V0RGF0YSk7XG4gICAgcmV0dXJuIGFzc2VtYmxlTGF5b3V0KHRoaXMsIGxheW91dERhdGEpO1xuICB9XG5cbiAgcHVibGljIGFzc2VtYmxlTWFya3MoKTogYW55W10ge1xuICAgIHJldHVybiBbXS5jb25jYXQoXG4gICAgICAvLyBheGlzR3JvdXAgaXMgYSBtYXBwaW5nIHRvIFZnTWFya0dyb3VwXG4gICAgICB2YWxzKHRoaXMuY29tcG9uZW50LmF4aXNHcm91cCksXG4gICAgICBmbGF0dGVuKHZhbHModGhpcy5jb21wb25lbnQuZ3JpZEdyb3VwKSksXG4gICAgICB0aGlzLmNvbXBvbmVudC5tYXJrXG4gICAgKTtcbiAgfVxuXG4gIHB1YmxpYyBjaGFubmVscygpIHtcbiAgICByZXR1cm4gW1JPVywgQ09MVU1OXTtcbiAgfVxuXG4gIHByb3RlY3RlZCBtYXBwaW5nKCkge1xuICAgIHJldHVybiB0aGlzLmZhY2V0KCk7XG4gIH1cblxuICBwdWJsaWMgaXNGYWNldCgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuXG4vLyBUT0RPOiBtb3ZlIHRoZSByZXN0IG9mIHRoZSBmaWxlIGludG8gRmFjZXRNb2RlbCBpZiBwb3NzaWJsZVxuXG5mdW5jdGlvbiBnZXRGYWNldEdyb3VwUHJvcGVydGllcyhtb2RlbDogRmFjZXRNb2RlbCkge1xuICBjb25zdCBjaGlsZCA9IG1vZGVsLmNoaWxkKCk7XG4gIGNvbnN0IG1lcmdlZENlbGxDb25maWcgPSBleHRlbmQoe30sIGNoaWxkLmNvbmZpZygpLmNlbGwsIGNoaWxkLmNvbmZpZygpLmZhY2V0LmNlbGwpO1xuXG4gIHJldHVybiBleHRlbmQoe1xuICAgICAgeDogbW9kZWwuaGFzKENPTFVNTikgPyB7XG4gICAgICAgICAgc2NhbGU6IG1vZGVsLnNjYWxlTmFtZShDT0xVTU4pLFxuICAgICAgICAgIGZpZWxkOiBtb2RlbC5maWVsZChDT0xVTU4pLFxuICAgICAgICAgIC8vIG9mZnNldCBieSB0aGUgcGFkZGluZ1xuICAgICAgICAgIG9mZnNldDogbW9kZWwuc2NhbGUoQ09MVU1OKS5wYWRkaW5nIC8gMlxuICAgICAgICB9IDoge3ZhbHVlOiBtb2RlbC5jb25maWcoKS5mYWNldC5zY2FsZS5wYWRkaW5nIC8gMn0sXG5cbiAgICAgIHk6IG1vZGVsLmhhcyhST1cpID8ge1xuICAgICAgICBzY2FsZTogbW9kZWwuc2NhbGVOYW1lKFJPVyksXG4gICAgICAgIGZpZWxkOiBtb2RlbC5maWVsZChST1cpLFxuICAgICAgICAvLyBvZmZzZXQgYnkgdGhlIHBhZGRpbmdcbiAgICAgICAgb2Zmc2V0OiBtb2RlbC5zY2FsZShST1cpLnBhZGRpbmcgLyAyXG4gICAgICB9IDoge3ZhbHVlOiBtb2RlbC5jb25maWcoKS5mYWNldC5zY2FsZS5wYWRkaW5nIC8gMn0sXG5cbiAgICAgIHdpZHRoOiB7ZmllbGQ6IHtwYXJlbnQ6IG1vZGVsLmNoaWxkKCkuc2l6ZU5hbWUoJ3dpZHRoJyl9fSxcbiAgICAgIGhlaWdodDoge2ZpZWxkOiB7cGFyZW50OiBtb2RlbC5jaGlsZCgpLnNpemVOYW1lKCdoZWlnaHQnKX19XG4gICAgfSxcbiAgICBjaGlsZC5hc3NlbWJsZVBhcmVudEdyb3VwUHJvcGVydGllcyhtZXJnZWRDZWxsQ29uZmlnKVxuICApO1xufVxuXG5mdW5jdGlvbiBwYXJzZUF4aXNHcm91cChtb2RlbDogRmFjZXRNb2RlbCwgY2hhbm5lbDogQ2hhbm5lbCkge1xuICAvLyBUT0RPOiBhZGQgYSBjYXNlIHdoZXJlIGlubmVyIHNwZWMgaXMgbm90IGEgdW5pdCAoZmFjZXQvbGF5ZXIvY29uY2F0KVxuICBsZXQgYXhpc0dyb3VwID0gbnVsbDtcblxuICBjb25zdCBjaGlsZCA9IG1vZGVsLmNoaWxkKCk7XG4gIGlmIChjaGlsZC5oYXMoY2hhbm5lbCkpIHtcbiAgICBpZiAoY2hpbGQuYXhpcyhjaGFubmVsKSkge1xuICAgICAgaWYgKHRydWUpIHsgLy8gdGhlIGNoYW5uZWwgaGFzIHNoYXJlZCBheGVzXG5cbiAgICAgICAgLy8gYWRkIGEgZ3JvdXAgZm9yIHRoZSBzaGFyZWQgYXhlc1xuICAgICAgICBheGlzR3JvdXAgPSBjaGFubmVsID09PSBYID8gZ2V0WEF4ZXNHcm91cChtb2RlbCkgOiBnZXRZQXhlc0dyb3VwKG1vZGVsKTtcblxuICAgICAgICBpZiAoY2hpbGQuYXhpcyhjaGFubmVsKSAmJiBncmlkU2hvdyhjaGlsZCwgY2hhbm5lbCkpIHsgLy8gc2hvdyBpbm5lciBncmlkXG4gICAgICAgICAgLy8gYWRkIGlubmVyIGF4aXMgKGFrYSBheGlzIHRoYXQgc2hvd3Mgb25seSBncmlkIHRvIClcbiAgICAgICAgICBjaGlsZC5jb21wb25lbnQuYXhpc1tjaGFubmVsXSA9IHBhcnNlSW5uZXJBeGlzKGNoYW5uZWwsIGNoaWxkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWxldGUgY2hpbGQuY29tcG9uZW50LmF4aXNbY2hhbm5lbF07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFRPRE86IGltcGxlbWVudCBpbmRlcGVuZGVudCBheGVzIHN1cHBvcnRcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGF4aXNHcm91cDtcbn1cblxuXG5mdW5jdGlvbiBnZXRYQXhlc0dyb3VwKG1vZGVsOiBGYWNldE1vZGVsKTogVmdNYXJrR3JvdXAge1xuICBjb25zdCBoYXNDb2wgPSBtb2RlbC5oYXMoQ09MVU1OKTtcbiAgcmV0dXJuIGV4dGVuZChcbiAgICB7XG4gICAgICBuYW1lOiBtb2RlbC5uYW1lKCd4LWF4ZXMnKSxcbiAgICAgIHR5cGU6ICdncm91cCdcbiAgICB9LFxuICAgIGhhc0NvbCA/IHtcbiAgICAgIGZyb206IHsgLy8gVE9ETzogaWYgd2UgZG8gZmFjZXQgdHJhbnNmb3JtIGF0IHRoZSBwYXJlbnQgbGV2ZWwgd2UgY2FuIHNhbWUgc29tZSB0cmFuc2Zvcm0gaGVyZVxuICAgICAgICBkYXRhOiBtb2RlbC5kYXRhVGFibGUoKSxcbiAgICAgICAgdHJhbnNmb3JtOiBbe1xuICAgICAgICAgIHR5cGU6ICdhZ2dyZWdhdGUnLFxuICAgICAgICAgIGdyb3VwYnk6IFttb2RlbC5maWVsZChDT0xVTU4pXSxcbiAgICAgICAgICBzdW1tYXJpemU6IHsnKic6IFsnY291bnQnXX0gLy8ganVzdCBhIHBsYWNlaG9sZGVyIGFnZ3JlZ2F0aW9uXG4gICAgICAgIH1dXG4gICAgICB9XG4gICAgfSA6IHt9LFxuICAgIHtcbiAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgdXBkYXRlOiB7XG4gICAgICAgICAgd2lkdGg6IHtmaWVsZDoge3BhcmVudDogbW9kZWwuY2hpbGQoKS5zaXplTmFtZSgnd2lkdGgnKX19LFxuICAgICAgICAgIGhlaWdodDoge1xuICAgICAgICAgICAgZmllbGQ6IHtncm91cDogJ2hlaWdodCd9XG4gICAgICAgICAgfSxcbiAgICAgICAgICB4OiBoYXNDb2wgPyB7XG4gICAgICAgICAgICBzY2FsZTogbW9kZWwuc2NhbGVOYW1lKENPTFVNTiksXG4gICAgICAgICAgICBmaWVsZDogbW9kZWwuZmllbGQoQ09MVU1OKSxcbiAgICAgICAgICAgIC8vIG9mZnNldCBieSB0aGUgcGFkZGluZ1xuICAgICAgICAgICAgb2Zmc2V0OiBtb2RlbC5zY2FsZShDT0xVTU4pLnBhZGRpbmcgLyAyXG4gICAgICAgICAgfSA6IHtcbiAgICAgICAgICAgIC8vIG9mZnNldCBieSB0aGUgcGFkZGluZ1xuICAgICAgICAgICAgdmFsdWU6IG1vZGVsLmNvbmZpZygpLmZhY2V0LnNjYWxlLnBhZGRpbmcgLyAyXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgYXhlczogW3BhcnNlQXhpcyhYLCBtb2RlbC5jaGlsZCgpKV1cbiAgICB9XG4gICk7XG59XG5cbmZ1bmN0aW9uIGdldFlBeGVzR3JvdXAobW9kZWw6IEZhY2V0TW9kZWwpOiBWZ01hcmtHcm91cCB7XG4gIGNvbnN0IGhhc1JvdyA9IG1vZGVsLmhhcyhST1cpO1xuICByZXR1cm4gZXh0ZW5kKFxuICAgIHtcbiAgICAgIG5hbWU6IG1vZGVsLm5hbWUoJ3ktYXhlcycpLFxuICAgICAgdHlwZTogJ2dyb3VwJ1xuICAgIH0sXG4gICAgaGFzUm93ID8ge1xuICAgICAgZnJvbToge1xuICAgICAgICBkYXRhOiBtb2RlbC5kYXRhVGFibGUoKSxcbiAgICAgICAgdHJhbnNmb3JtOiBbe1xuICAgICAgICAgIHR5cGU6ICdhZ2dyZWdhdGUnLFxuICAgICAgICAgIGdyb3VwYnk6IFttb2RlbC5maWVsZChST1cpXSxcbiAgICAgICAgICBzdW1tYXJpemU6IHsnKic6IFsnY291bnQnXX0gLy8ganVzdCBhIHBsYWNlaG9sZGVyIGFnZ3JlZ2F0aW9uXG4gICAgICAgIH1dXG4gICAgICB9XG4gICAgfSA6IHt9LFxuICAgIHtcbiAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgdXBkYXRlOiB7XG4gICAgICAgICAgd2lkdGg6IHtcbiAgICAgICAgICAgIGZpZWxkOiB7Z3JvdXA6ICd3aWR0aCd9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBoZWlnaHQ6IHtmaWVsZDoge3BhcmVudDogbW9kZWwuY2hpbGQoKS5zaXplTmFtZSgnaGVpZ2h0Jyl9fSxcbiAgICAgICAgICB5OiBoYXNSb3cgPyB7XG4gICAgICAgICAgICBzY2FsZTogbW9kZWwuc2NhbGVOYW1lKFJPVyksXG4gICAgICAgICAgICBmaWVsZDogbW9kZWwuZmllbGQoUk9XKSxcbiAgICAgICAgICAgIC8vIG9mZnNldCBieSB0aGUgcGFkZGluZ1xuICAgICAgICAgICAgb2Zmc2V0OiBtb2RlbC5zY2FsZShST1cpLnBhZGRpbmcgLyAyXG4gICAgICAgICAgfSA6IHtcbiAgICAgICAgICAgIC8vIG9mZnNldCBieSB0aGUgcGFkZGluZ1xuICAgICAgICAgICAgdmFsdWU6IG1vZGVsLmNvbmZpZygpLmZhY2V0LnNjYWxlLnBhZGRpbmcgLyAyXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgYXhlczogW3BhcnNlQXhpcyhZLCBtb2RlbC5jaGlsZCgpKV1cbiAgICB9XG4gICk7XG59XG5cbmZ1bmN0aW9uIGdldFJvd0dyaWRHcm91cHMobW9kZWw6IE1vZGVsKTogYW55W10geyAvLyBUT0RPOiBWZ01hcmtzXG4gIGNvbnN0IGZhY2V0R3JpZENvbmZpZyA9IG1vZGVsLmNvbmZpZygpLmZhY2V0LmdyaWQ7XG5cbiAgY29uc3Qgcm93R3JpZCA9IHtcbiAgICBuYW1lOiBtb2RlbC5uYW1lKCdyb3ctZ3JpZCcpLFxuICAgIHR5cGU6ICdydWxlJyxcbiAgICBmcm9tOiB7XG4gICAgICBkYXRhOiBtb2RlbC5kYXRhVGFibGUoKSxcbiAgICAgIHRyYW5zZm9ybTogW3t0eXBlOiAnZmFjZXQnLCBncm91cGJ5OiBbbW9kZWwuZmllbGQoUk9XKV19XVxuICAgIH0sXG4gICAgcHJvcGVydGllczoge1xuICAgICAgdXBkYXRlOiB7XG4gICAgICAgIHk6IHtcbiAgICAgICAgICBzY2FsZTogbW9kZWwuc2NhbGVOYW1lKFJPVyksXG4gICAgICAgICAgZmllbGQ6IG1vZGVsLmZpZWxkKFJPVylcbiAgICAgICAgfSxcbiAgICAgICAgeDoge3ZhbHVlOiAwLCBvZmZzZXQ6IC1mYWNldEdyaWRDb25maWcub2Zmc2V0IH0sXG4gICAgICAgIHgyOiB7ZmllbGQ6IHtncm91cDogJ3dpZHRoJ30sIG9mZnNldDogZmFjZXRHcmlkQ29uZmlnLm9mZnNldCB9LFxuICAgICAgICBzdHJva2U6IHsgdmFsdWU6IGZhY2V0R3JpZENvbmZpZy5jb2xvciB9LFxuICAgICAgICBzdHJva2VPcGFjaXR5OiB7IHZhbHVlOiBmYWNldEdyaWRDb25maWcub3BhY2l0eSB9LFxuICAgICAgICBzdHJva2VXaWR0aDoge3ZhbHVlOiAwLjV9XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBbcm93R3JpZCwge1xuICAgIG5hbWU6IG1vZGVsLm5hbWUoJ3Jvdy1ncmlkLWVuZCcpLFxuICAgIHR5cGU6ICdydWxlJyxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICB1cGRhdGU6IHtcbiAgICAgICAgeTogeyBmaWVsZDoge2dyb3VwOiAnaGVpZ2h0J319LFxuICAgICAgICB4OiB7dmFsdWU6IDAsIG9mZnNldDogLWZhY2V0R3JpZENvbmZpZy5vZmZzZXQgfSxcbiAgICAgICAgeDI6IHtmaWVsZDoge2dyb3VwOiAnd2lkdGgnfSwgb2Zmc2V0OiBmYWNldEdyaWRDb25maWcub2Zmc2V0IH0sXG4gICAgICAgIHN0cm9rZTogeyB2YWx1ZTogZmFjZXRHcmlkQ29uZmlnLmNvbG9yIH0sXG4gICAgICAgIHN0cm9rZU9wYWNpdHk6IHsgdmFsdWU6IGZhY2V0R3JpZENvbmZpZy5vcGFjaXR5IH0sXG4gICAgICAgIHN0cm9rZVdpZHRoOiB7dmFsdWU6IDAuNX1cbiAgICAgIH1cbiAgICB9XG4gIH1dO1xufVxuXG5mdW5jdGlvbiBnZXRDb2x1bW5HcmlkR3JvdXBzKG1vZGVsOiBNb2RlbCk6IGFueSB7IC8vIFRPRE86IFZnTWFya3NcbiAgY29uc3QgZmFjZXRHcmlkQ29uZmlnID0gbW9kZWwuY29uZmlnKCkuZmFjZXQuZ3JpZDtcblxuICBjb25zdCBjb2x1bW5HcmlkID0ge1xuICAgIG5hbWU6IG1vZGVsLm5hbWUoJ2NvbHVtbi1ncmlkJyksXG4gICAgdHlwZTogJ3J1bGUnLFxuICAgIGZyb206IHtcbiAgICAgIGRhdGE6IG1vZGVsLmRhdGFUYWJsZSgpLFxuICAgICAgdHJhbnNmb3JtOiBbe3R5cGU6ICdmYWNldCcsIGdyb3VwYnk6IFttb2RlbC5maWVsZChDT0xVTU4pXX1dXG4gICAgfSxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICB1cGRhdGU6IHtcbiAgICAgICAgeDoge1xuICAgICAgICAgIHNjYWxlOiBtb2RlbC5zY2FsZU5hbWUoQ09MVU1OKSxcbiAgICAgICAgICBmaWVsZDogbW9kZWwuZmllbGQoQ09MVU1OKVxuICAgICAgICB9LFxuICAgICAgICB5OiB7dmFsdWU6IDAsIG9mZnNldDogLWZhY2V0R3JpZENvbmZpZy5vZmZzZXR9LFxuICAgICAgICB5Mjoge2ZpZWxkOiB7Z3JvdXA6ICdoZWlnaHQnfSwgb2Zmc2V0OiBmYWNldEdyaWRDb25maWcub2Zmc2V0IH0sXG4gICAgICAgIHN0cm9rZTogeyB2YWx1ZTogZmFjZXRHcmlkQ29uZmlnLmNvbG9yIH0sXG4gICAgICAgIHN0cm9rZU9wYWNpdHk6IHsgdmFsdWU6IGZhY2V0R3JpZENvbmZpZy5vcGFjaXR5IH0sXG4gICAgICAgIHN0cm9rZVdpZHRoOiB7dmFsdWU6IDAuNX1cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIFtjb2x1bW5HcmlkLCAge1xuICAgIG5hbWU6IG1vZGVsLm5hbWUoJ2NvbHVtbi1ncmlkLWVuZCcpLFxuICAgIHR5cGU6ICdydWxlJyxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICB1cGRhdGU6IHtcbiAgICAgICAgeDogeyBmaWVsZDoge2dyb3VwOiAnd2lkdGgnfX0sXG4gICAgICAgIHk6IHt2YWx1ZTogMCwgb2Zmc2V0OiAtZmFjZXRHcmlkQ29uZmlnLm9mZnNldH0sXG4gICAgICAgIHkyOiB7ZmllbGQ6IHtncm91cDogJ2hlaWdodCd9LCBvZmZzZXQ6IGZhY2V0R3JpZENvbmZpZy5vZmZzZXQgfSxcbiAgICAgICAgc3Ryb2tlOiB7IHZhbHVlOiBmYWNldEdyaWRDb25maWcuY29sb3IgfSxcbiAgICAgICAgc3Ryb2tlT3BhY2l0eTogeyB2YWx1ZTogZmFjZXRHcmlkQ29uZmlnLm9wYWNpdHkgfSxcbiAgICAgICAgc3Ryb2tlV2lkdGg6IHt2YWx1ZTogMC41fVxuICAgICAgfVxuICAgIH1cbiAgfV07XG59XG4iLCJpbXBvcnQge0NoYW5uZWx9IGZyb20gJy4uL2NoYW5uZWwnO1xuaW1wb3J0IHtrZXlzLCBkdXBsaWNhdGUsIG1lcmdlRGVlcCwgZmxhdHRlbiwgdW5pcXVlLCBpc0FycmF5LCB2YWxzLCBoYXNoLCBEaWN0fSBmcm9tICcuLi91dGlsJztcbmltcG9ydCB7ZGVmYXVsdENvbmZpZywgQ29uZmlnfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHtMYXllclNwZWN9IGZyb20gJy4uL3NwZWMnO1xuaW1wb3J0IHthc3NlbWJsZURhdGEsIHBhcnNlTGF5ZXJEYXRhfSBmcm9tICcuL2RhdGEvZGF0YSc7XG5pbXBvcnQge2Fzc2VtYmxlTGF5b3V0LCBwYXJzZUxheWVyTGF5b3V0fSBmcm9tICcuL2xheW91dCc7XG5pbXBvcnQge01vZGVsfSBmcm9tICcuL21vZGVsJztcbmltcG9ydCB7VW5pdE1vZGVsfSBmcm9tICcuL3VuaXQnO1xuaW1wb3J0IHtidWlsZE1vZGVsfSBmcm9tICcuL2NvbW1vbic7XG5pbXBvcnQge0ZpZWxkRGVmfSBmcm9tICcuLi9maWVsZGRlZic7XG5pbXBvcnQge1NjYWxlQ29tcG9uZW50c30gZnJvbSAnLi9zY2FsZSc7XG5pbXBvcnQge1ZnRGF0YSwgVmdBeGlzLCBWZ0xlZ2VuZCwgaXNVbmlvbmVkRG9tYWluLCBpc0RhdGFSZWZEb21haW4sIFZnRGF0YVJlZn0gZnJvbSAnLi4vdmVnYS5zY2hlbWEnO1xuXG5cbmV4cG9ydCBjbGFzcyBMYXllck1vZGVsIGV4dGVuZHMgTW9kZWwge1xuICBwcml2YXRlIF9jaGlsZHJlbjogVW5pdE1vZGVsW107XG5cbiAgY29uc3RydWN0b3Ioc3BlYzogTGF5ZXJTcGVjLCBwYXJlbnQ6IE1vZGVsLCBwYXJlbnRHaXZlbk5hbWU6IHN0cmluZykge1xuICAgIHN1cGVyKHNwZWMsIHBhcmVudCwgcGFyZW50R2l2ZW5OYW1lKTtcblxuICAgIHRoaXMuX2NvbmZpZyA9IHRoaXMuX2luaXRDb25maWcoc3BlYy5jb25maWcsIHBhcmVudCk7XG4gICAgdGhpcy5fY2hpbGRyZW4gPSBzcGVjLmxheWVycy5tYXAoKGxheWVyLCBpKSA9PiB7XG4gICAgICAvLyB3ZSBrbm93IHRoYXQgdGhlIG1vZGVsIGhhcyB0byBiZSBhIHVuaXQgbW9kZWwgYmVhY3VzZSB3ZSBwYXNzIGluIGEgdW5pdCBzcGVjXG4gICAgICByZXR1cm4gYnVpbGRNb2RlbChsYXllciwgdGhpcywgdGhpcy5uYW1lKCdsYXllcl8nICsgaSkpIGFzIFVuaXRNb2RlbDtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2luaXRDb25maWcoc3BlY0NvbmZpZzogQ29uZmlnLCBwYXJlbnQ6IE1vZGVsKSB7XG4gICAgcmV0dXJuIG1lcmdlRGVlcChkdXBsaWNhdGUoZGVmYXVsdENvbmZpZyksIHNwZWNDb25maWcsIHBhcmVudCA/IHBhcmVudC5jb25maWcoKSA6IHt9KTtcbiAgfVxuXG4gIHB1YmxpYyBoYXMoY2hhbm5lbDogQ2hhbm5lbCk6IGJvb2xlYW4ge1xuICAgIC8vIGxheWVyIGRvZXMgbm90IGhhdmUgYW55IGNoYW5uZWxzXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcHVibGljIGNoaWxkcmVuKCkge1xuICAgIHJldHVybiB0aGlzLl9jaGlsZHJlbjtcbiAgfVxuXG4gIHB1YmxpYyBpc09yZGluYWxTY2FsZShjaGFubmVsOiBDaGFubmVsKSB7XG4gICAgLy8gc2luY2Ugd2UgYXNzdW1lIHNoYXJlZCBzY2FsZXMgd2UgY2FuIGp1c3QgYXNrIHRoZSBmaXJzdCBjaGlsZFxuICAgIHJldHVybiB0aGlzLl9jaGlsZHJlblswXS5pc09yZGluYWxTY2FsZShjaGFubmVsKTtcbiAgfVxuXG4gIHB1YmxpYyBkYXRhVGFibGUoKTogc3RyaW5nIHtcbiAgICAvLyBGSVhNRTogZG9uJ3QganVzdCB1c2UgdGhlIGZpcnN0IGNoaWxkXG4gICAgcmV0dXJuIHRoaXMuX2NoaWxkcmVuWzBdLmRhdGFUYWJsZSgpO1xuICB9XG5cbiAgcHVibGljIGZpZWxkRGVmKGNoYW5uZWw6IENoYW5uZWwpOiBGaWVsZERlZiB7XG4gICAgcmV0dXJuIG51bGw7IC8vIGxheWVyIGRvZXMgbm90IGhhdmUgZmllbGQgZGVmc1xuICB9XG5cbiAgcHVibGljIHN0YWNrKCkge1xuICAgIHJldHVybiBudWxsOyAvLyB0aGlzIGlzIG9ubHkgYSBwcm9wZXJ0eSBmb3IgVW5pdE1vZGVsXG4gIH1cblxuICBwdWJsaWMgcGFyc2VEYXRhKCkge1xuICAgIHRoaXMuX2NoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgICBjaGlsZC5wYXJzZURhdGEoKTtcbiAgICB9KTtcbiAgICB0aGlzLmNvbXBvbmVudC5kYXRhID0gcGFyc2VMYXllckRhdGEodGhpcyk7XG4gIH1cblxuICBwdWJsaWMgcGFyc2VTZWxlY3Rpb25EYXRhKCkge1xuICAgIC8vIFRPRE86IEBhcnZpbmQgY2FuIHdyaXRlIHRoaXNcbiAgICAvLyBXZSBtaWdodCBuZWVkIHRvIHNwbGl0IHRoaXMgaW50byBjb21waWxlU2VsZWN0aW9uRGF0YSBhbmQgY29tcGlsZVNlbGVjdGlvblNpZ25hbHM/XG4gIH1cblxuICBwdWJsaWMgcGFyc2VMYXlvdXREYXRhKCkge1xuICAgIC8vIFRPRE86IGNvcnJlY3RseSB1bmlvbiBvcmRpbmFsIHNjYWxlcyByYXRoZXIgdGhhbiBqdXN0IHVzaW5nIHRoZSBsYXlvdXQgb2YgdGhlIGZpcnN0IGNoaWxkXG4gICAgdGhpcy5fY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQsIGkpID0+IHtcbiAgICAgIGNoaWxkLnBhcnNlTGF5b3V0RGF0YSgpO1xuICAgIH0pO1xuICAgIHRoaXMuY29tcG9uZW50LmxheW91dCA9IHBhcnNlTGF5ZXJMYXlvdXQodGhpcyk7XG4gIH1cblxuICBwdWJsaWMgcGFyc2VTY2FsZSgpIHtcbiAgICBjb25zdCBtb2RlbCA9IHRoaXM7XG5cbiAgICBsZXQgc2NhbGVDb21wb25lbnQgPSB0aGlzLmNvbXBvbmVudC5zY2FsZSA9IHt9IGFzIERpY3Q8U2NhbGVDb21wb25lbnRzPjtcblxuICAgIHRoaXMuX2NoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24oY2hpbGQpIHtcbiAgICAgIGNoaWxkLnBhcnNlU2NhbGUoKTtcblxuICAgICAgLy8gRklYTUU6IGNvcnJlY3RseSBpbXBsZW1lbnQgaW5kZXBlbmRlbnQgc2NhbGVcbiAgICAgIGlmICh0cnVlKSB7IC8vIGlmIHNoYXJlZC91bmlvbiBzY2FsZVxuICAgICAgICBrZXlzKGNoaWxkLmNvbXBvbmVudC5zY2FsZSkuZm9yRWFjaChmdW5jdGlvbihjaGFubmVsKSB7XG4gICAgICAgICAgbGV0IGNoaWxkU2NhbGVzOiBTY2FsZUNvbXBvbmVudHMgPSBjaGlsZC5jb21wb25lbnQuc2NhbGVbY2hhbm5lbF07XG4gICAgICAgICAgaWYgKCFjaGlsZFNjYWxlcykge1xuICAgICAgICAgICAgLy8gdGhlIGNoaWxkIGRvZXMgbm90IGhhdmUgYW55IHNjYWxlcyBzbyB3ZSBoYXZlIG5vdGhpbmcgdG8gbWVyZ2VcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBtb2RlbFNjYWxlczogU2NhbGVDb21wb25lbnRzID0gc2NhbGVDb21wb25lbnRbY2hhbm5lbF07XG4gICAgICAgICAgaWYgKG1vZGVsU2NhbGVzICYmIG1vZGVsU2NhbGVzLm1haW4pIHtcbiAgICAgICAgICAgIC8vIFNjYWxlcyBhcmUgdW5pb25lZCBieSBjb21iaW5pbmcgdGhlIGRvbWFpbiBvZiB0aGUgbWFpbiBzY2FsZS5cbiAgICAgICAgICAgIC8vIE90aGVyIHNjYWxlcyB0aGF0IGFyZSB1c2VkIGZvciBvcmRpbmFsIGxlZ2VuZHMgYXJlIGFwcGVuZGVkLlxuICAgICAgICAgICAgY29uc3QgbW9kZWxEb21haW4gPSBtb2RlbFNjYWxlcy5tYWluLmRvbWFpbjtcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkRG9tYWluID0gY2hpbGRTY2FsZXMubWFpbi5kb21haW47XG5cbiAgICAgICAgICAgIGlmIChpc0FycmF5KG1vZGVsRG9tYWluKSkge1xuICAgICAgICAgICAgICBpZiAoaXNBcnJheShjaGlsZFNjYWxlcy5tYWluLmRvbWFpbikpIHtcbiAgICAgICAgICAgICAgICBtb2RlbFNjYWxlcy5tYWluLmRvbWFpbiA9IG1vZGVsRG9tYWluLmNvbmNhdChjaGlsZERvbWFpbik7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbW9kZWwuYWRkV2FybmluZygnY3VzdG9tIGRvbWFpbiBzY2FsZSBjYW5ub3QgYmUgdW5pb25lZCB3aXRoIGRlZmF1bHQgZmllbGQtYmFzZWQgZG9tYWluJyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnN0IHVuaW9uZWRGaWVsZHMgPSBpc1VuaW9uZWREb21haW4obW9kZWxEb21haW4pID8gbW9kZWxEb21haW4uZmllbGRzIDogW21vZGVsRG9tYWluXSBhcyBWZ0RhdGFSZWZbXTtcblxuICAgICAgICAgICAgICBpZiAoaXNBcnJheShjaGlsZERvbWFpbikpIHtcbiAgICAgICAgICAgICAgICBtb2RlbC5hZGRXYXJuaW5nKCdjdXN0b20gZG9tYWluIHNjYWxlIGNhbm5vdCBiZSB1bmlvbmVkIHdpdGggZGVmYXVsdCBmaWVsZC1iYXNlZCBkb21haW4nKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGxldCBmaWVsZHMgPSBpc0RhdGFSZWZEb21haW4oY2hpbGREb21haW4pID8gdW5pb25lZEZpZWxkcy5jb25jYXQoW2NoaWxkRG9tYWluXSkgOlxuICAgICAgICAgICAgICAgIC8vIGlmIHRoZSBkb21haW4gaXMgaXRzZWxmIGEgdW5pb24gZG9tYWluLCBjb25jYXRcbiAgICAgICAgICAgICAgICBpc1VuaW9uZWREb21haW4oY2hpbGREb21haW4pID8gdW5pb25lZEZpZWxkcy5jb25jYXQoY2hpbGREb21haW4uZmllbGRzKSA6XG4gICAgICAgICAgICAgICAgICAvLyB3ZSBoYXZlIHRvIGlnbm9yZSBleHBsaWNpdCBkYXRhIGRvbWFpbnMgZm9yIG5vdyBiZWNhdXNlIHZlZ2EgZG9lcyBub3Qgc3VwcG9ydCB1bmlvbmluZyB0aGVtXG4gICAgICAgICAgICAgICAgICB1bmlvbmVkRmllbGRzO1xuICAgICAgICAgICAgICBmaWVsZHMgPSB1bmlxdWUoZmllbGRzLCBoYXNoKTtcbiAgICAgICAgICAgICAgLy8gVE9ETzogaWYgYWxsIGRvbWFpbnMgdXNlIHRoZSBzYW1lIGRhdGEsIHdlIGNhbiBtZXJnZSB0aGVtXG4gICAgICAgICAgICAgIGlmIChmaWVsZHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgIG1vZGVsU2NhbGVzLm1haW4uZG9tYWluID0geyBmaWVsZHM6IGZpZWxkcyB9O1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG1vZGVsU2NhbGVzLm1haW4uZG9tYWluID0gZmllbGRzWzBdO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNyZWF0ZSBjb2xvciBsZWdlbmQgYW5kIGNvbG9yIGxlZ2VuZCBiaW4gc2NhbGVzIGlmIHdlIGRvbid0IGhhdmUgdGhlbSB5ZXRcbiAgICAgICAgICAgIG1vZGVsU2NhbGVzLmNvbG9yTGVnZW5kID0gbW9kZWxTY2FsZXMuY29sb3JMZWdlbmQgPyBtb2RlbFNjYWxlcy5jb2xvckxlZ2VuZCA6IGNoaWxkU2NhbGVzLmNvbG9yTGVnZW5kO1xuICAgICAgICAgICAgbW9kZWxTY2FsZXMuYmluQ29sb3JMZWdlbmQgPSBtb2RlbFNjYWxlcy5iaW5Db2xvckxlZ2VuZCA/IG1vZGVsU2NhbGVzLmJpbkNvbG9yTGVnZW5kIDogY2hpbGRTY2FsZXMuYmluQ29sb3JMZWdlbmQ7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNjYWxlQ29tcG9uZW50W2NoYW5uZWxdID0gY2hpbGRTY2FsZXM7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gcmVuYW1lIGNoaWxkIHNjYWxlcyB0byBwYXJlbnQgc2NhbGVzXG4gICAgICAgICAgdmFscyhjaGlsZFNjYWxlcykuZm9yRWFjaChmdW5jdGlvbihzY2FsZSkge1xuICAgICAgICAgICAgY29uc3Qgc2NhbGVOYW1lV2l0aG91dFByZWZpeCA9IHNjYWxlLm5hbWUuc3Vic3RyKGNoaWxkLm5hbWUoJycpLmxlbmd0aCk7XG4gICAgICAgICAgICBjb25zdCBuZXdOYW1lID0gbW9kZWwuc2NhbGVOYW1lKHNjYWxlTmFtZVdpdGhvdXRQcmVmaXgpO1xuICAgICAgICAgICAgY2hpbGQucmVuYW1lU2NhbGUoc2NhbGUubmFtZSwgbmV3TmFtZSk7XG4gICAgICAgICAgICBzY2FsZS5uYW1lID0gbmV3TmFtZTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGRlbGV0ZSBjaGlsZFNjYWxlc1tjaGFubmVsXTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgcGFyc2VNYXJrKCkge1xuICAgIHRoaXMuX2NoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24oY2hpbGQpIHtcbiAgICAgIGNoaWxkLnBhcnNlTWFyaygpO1xuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIHBhcnNlQXhpcygpIHtcbiAgICBsZXQgYXhpc0NvbXBvbmVudCA9IHRoaXMuY29tcG9uZW50LmF4aXMgPSB7fSBhcyBEaWN0PFZnQXhpc1tdPjtcblxuICAgIHRoaXMuX2NoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24oY2hpbGQpIHtcbiAgICAgIGNoaWxkLnBhcnNlQXhpcygpO1xuXG4gICAgICAvLyBUT0RPOiBjb3JyZWN0bHkgaW1wbGVtZW50IGluZGVwZW5kZW50IGF4ZXNcbiAgICAgIGlmICh0cnVlKSB7IC8vIGlmIHNoYXJlZC91bmlvbiBzY2FsZVxuICAgICAgICBrZXlzKGNoaWxkLmNvbXBvbmVudC5heGlzKS5mb3JFYWNoKGZ1bmN0aW9uKGNoYW5uZWwpIHtcbiAgICAgICAgICAvLyBUT0RPOiBzdXBwb3J0IG11bHRpcGxlIGF4ZXMgZm9yIHNoYXJlZCBzY2FsZVxuXG4gICAgICAgICAgLy8ganVzdCB1c2UgdGhlIGZpcnN0IGF4aXMgZGVmaW5pdGlvbiBmb3IgZWFjaCBjaGFubmVsXG4gICAgICAgICAgaWYgKCFheGlzQ29tcG9uZW50W2NoYW5uZWxdKSB7XG4gICAgICAgICAgICBheGlzQ29tcG9uZW50W2NoYW5uZWxdID0gY2hpbGQuY29tcG9uZW50LmF4aXNbY2hhbm5lbF07XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBwYXJzZUF4aXNHcm91cCgpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHB1YmxpYyBwYXJzZUdyaWRHcm91cCgpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHB1YmxpYyBwYXJzZUxlZ2VuZCgpIHtcbiAgICBsZXQgbGVnZW5kQ29tcG9uZW50ID0gdGhpcy5jb21wb25lbnQubGVnZW5kID0ge30gYXMgRGljdDxWZ0xlZ2VuZD47XG5cbiAgICB0aGlzLl9jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICBjaGlsZC5wYXJzZUxlZ2VuZCgpO1xuXG4gICAgICAvLyBUT0RPOiBjb3JyZWN0bHkgaW1wbGVtZW50IGluZGVwZW5kZW50IGF4ZXNcbiAgICAgIGlmICh0cnVlKSB7IC8vIGlmIHNoYXJlZC91bmlvbiBzY2FsZVxuICAgICAgICBrZXlzKGNoaWxkLmNvbXBvbmVudC5sZWdlbmQpLmZvckVhY2goZnVuY3Rpb24oY2hhbm5lbCkge1xuICAgICAgICAgIC8vIGp1c3QgdXNlIHRoZSBmaXJzdCBsZWdlbmQgZGVmaW5pdGlvbiBmb3IgZWFjaCBjaGFubmVsXG4gICAgICAgICAgaWYgKCFsZWdlbmRDb21wb25lbnRbY2hhbm5lbF0pIHtcbiAgICAgICAgICAgIGxlZ2VuZENvbXBvbmVudFtjaGFubmVsXSA9IGNoaWxkLmNvbXBvbmVudC5sZWdlbmRbY2hhbm5lbF07XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBhc3NlbWJsZVBhcmVudEdyb3VwUHJvcGVydGllcygpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHB1YmxpYyBhc3NlbWJsZURhdGEoZGF0YTogVmdEYXRhW10pOiBWZ0RhdGFbXSB7XG4gICAgLy8gUHJlZml4IHRyYXZlcnNhbCDigJMgcGFyZW50IGRhdGEgbWlnaHQgYmUgcmVmZXJyZWQgdG8gYnkgY2hpbGRyZW4gZGF0YVxuICAgIGFzc2VtYmxlRGF0YSh0aGlzLCBkYXRhKTtcbiAgICB0aGlzLl9jaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgICAgY2hpbGQuYXNzZW1ibGVEYXRhKGRhdGEpO1xuICAgIH0pO1xuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgcHVibGljIGFzc2VtYmxlTGF5b3V0KGxheW91dERhdGE6IFZnRGF0YVtdKTogVmdEYXRhW10ge1xuICAgIC8vIFBvc3RmaXggdHJhdmVyc2FsIOKAkyBsYXlvdXQgaXMgYXNzZW1ibGVkIGJvdHRvbS11cFxuICAgIHRoaXMuX2NoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgICBjaGlsZC5hc3NlbWJsZUxheW91dChsYXlvdXREYXRhKTtcbiAgICB9KTtcbiAgICByZXR1cm4gYXNzZW1ibGVMYXlvdXQodGhpcywgbGF5b3V0RGF0YSk7XG4gIH1cblxuICBwdWJsaWMgYXNzZW1ibGVNYXJrcygpOiBhbnlbXSB7XG4gICAgLy8gb25seSBjaGlsZHJlbiBoYXZlIG1hcmtzXG4gICAgcmV0dXJuIGZsYXR0ZW4odGhpcy5fY2hpbGRyZW4ubWFwKChjaGlsZCkgPT4ge1xuICAgICAgcmV0dXJuIGNoaWxkLmFzc2VtYmxlTWFya3MoKTtcbiAgICB9KSk7XG4gIH1cblxuICBwdWJsaWMgY2hhbm5lbHMoKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgcHJvdGVjdGVkIG1hcHBpbmcoKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwdWJsaWMgaXNMYXllcigpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGNoaWxkIGVpdGhlciBoYXMgbm8gc291cmNlIGRlZmluZWQgb3IgdXNlcyB0aGUgc2FtZSB1cmwuXG4gICAqIFRoaXMgaXMgdXNlZnVsIGlmIHlvdSB3YW50IHRvIGtub3cgd2hldGhlciBpdCBpcyBwb3NzaWJsZSB0byBtb3ZlIGEgZmlsdGVyIHVwLlxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIGNhbiBvbmx5IGJlIGNhbGxlZCBvbmNlIHRoIGNoaWxkIGhhcyBiZWVuIHBhcnNlZC5cbiAgICovXG4gIHB1YmxpYyBjb21wYXRpYmxlU291cmNlKGNoaWxkOiBVbml0TW9kZWwpIHtcbiAgICBjb25zdCBzb3VyY2VVcmwgPSB0aGlzLmRhdGEoKS51cmw7XG4gICAgY29uc3QgY2hpbGREYXRhID0gY2hpbGQuY29tcG9uZW50LmRhdGE7XG4gICAgY29uc3QgY29tcGF0aWJsZSA9ICFjaGlsZERhdGEuc291cmNlIHx8IChzb3VyY2VVcmwgJiYgc291cmNlVXJsID09PSBjaGlsZERhdGEuc291cmNlLnVybCk7XG4gICAgcmV0dXJuIGNvbXBhdGlibGU7XG4gIH1cbn1cbiIsIlxuaW1wb3J0IHtDaGFubmVsLCBYLCBZLCBST1csIENPTFVNTn0gZnJvbSAnLi4vY2hhbm5lbCc7XG5pbXBvcnQge0xBWU9VVH0gZnJvbSAnLi4vZGF0YSc7XG5pbXBvcnQge1NjYWxlVHlwZX0gZnJvbSAnLi4vc2NhbGUnO1xuaW1wb3J0IHtGb3JtdWxhfSBmcm9tICcuLi90cmFuc2Zvcm0nO1xuaW1wb3J0IHtleHRlbmQsIGtleXMsIFN0cmluZ1NldH0gZnJvbSAnLi4vdXRpbCc7XG5pbXBvcnQge1ZnRGF0YX0gZnJvbSAnLi4vdmVnYS5zY2hlbWEnO1xuXG5pbXBvcnQge0ZhY2V0TW9kZWx9IGZyb20gJy4vZmFjZXQnO1xuaW1wb3J0IHtMYXllck1vZGVsfSBmcm9tICcuL2xheWVyJztcbmltcG9ydCB7VEVYVCBhcyBURVhUX01BUkt9IGZyb20gJy4uL21hcmsnO1xuaW1wb3J0IHtNb2RlbH0gZnJvbSAnLi9tb2RlbCc7XG5pbXBvcnQge3Jhd0RvbWFpbn0gZnJvbSAnLi90aW1lJztcbmltcG9ydCB7VW5pdE1vZGVsfSBmcm9tICcuL3VuaXQnO1xuXG4vLyBGSVhNRTogZm9yIG5lc3RpbmcgeCBhbmQgeSwgd2UgbmVlZCB0byBkZWNsYXJlIHgseSBsYXlvdXQgc2VwYXJhdGVseSBiZWZvcmUgam9pbmluZyBsYXRlclxuLy8gRm9yIG5vdywgbGV0J3MgYWx3YXlzIGFzc3VtZSBzaGFyZWQgc2NhbGVcbmV4cG9ydCBpbnRlcmZhY2UgTGF5b3V0Q29tcG9uZW50IHtcbiAgd2lkdGg6IFNpemVDb21wb25lbnQ7XG4gIGhlaWdodDogU2l6ZUNvbXBvbmVudDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTaXplQ29tcG9uZW50IHtcbiAgLyoqIEZpZWxkIHRoYXQgd2UgbmVlZCB0byBjYWxjdWxhdGUgZGlzdGluY3QgKi9cbiAgZGlzdGluY3Q6IFN0cmluZ1NldDtcblxuICAvKiogQXJyYXkgb2YgZm9ybXVsYXMgKi9cbiAgZm9ybXVsYTogRm9ybXVsYVtdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXNzZW1ibGVMYXlvdXQobW9kZWw6IE1vZGVsLCBsYXlvdXREYXRhOiBWZ0RhdGFbXSk6IFZnRGF0YVtdIHtcbiAgY29uc3QgbGF5b3V0Q29tcG9uZW50ID0gbW9kZWwuY29tcG9uZW50LmxheW91dDtcbiAgaWYgKCFsYXlvdXRDb21wb25lbnQud2lkdGggJiYgIWxheW91dENvbXBvbmVudC5oZWlnaHQpIHtcbiAgICByZXR1cm4gbGF5b3V0RGF0YTsgLy8gRG8gbm90aGluZ1xuICB9XG5cbiAgaWYgKHRydWUpIHsgLy8gaWYgYm90aCBhcmUgc2hhcmVkIHNjYWxlLCB3ZSBjYW4gc2ltcGx5IG1lcmdlIGRhdGEgc291cmNlIGZvciB3aWR0aCBhbmQgZm9yIGhlaWdodFxuICAgIGNvbnN0IGRpc3RpbmN0RmllbGRzID0ga2V5cyhleHRlbmQobGF5b3V0Q29tcG9uZW50LndpZHRoLmRpc3RpbmN0LCBsYXlvdXRDb21wb25lbnQuaGVpZ2h0LmRpc3RpbmN0KSk7XG4gICAgY29uc3QgZm9ybXVsYSA9IGxheW91dENvbXBvbmVudC53aWR0aC5mb3JtdWxhLmNvbmNhdChsYXlvdXRDb21wb25lbnQuaGVpZ2h0LmZvcm11bGEpXG4gICAgICAubWFwKGZ1bmN0aW9uKGZvcm11bGEpIHtcbiAgICAgICAgcmV0dXJuIGV4dGVuZCh7dHlwZTogJ2Zvcm11bGEnfSwgZm9ybXVsYSk7XG4gICAgICB9KTtcblxuICAgIHJldHVybiBbXG4gICAgICBkaXN0aW5jdEZpZWxkcy5sZW5ndGggPiAwID8ge1xuICAgICAgICBuYW1lOiBtb2RlbC5kYXRhTmFtZShMQVlPVVQpLFxuICAgICAgICBzb3VyY2U6IG1vZGVsLmRhdGFUYWJsZSgpLFxuICAgICAgICB0cmFuc2Zvcm06IFt7XG4gICAgICAgICAgICB0eXBlOiAnYWdncmVnYXRlJyxcbiAgICAgICAgICAgIHN1bW1hcml6ZTogZGlzdGluY3RGaWVsZHMubWFwKGZ1bmN0aW9uKGZpZWxkKSB7XG4gICAgICAgICAgICAgIHJldHVybiB7IGZpZWxkOiBmaWVsZCwgb3BzOiBbJ2Rpc3RpbmN0J10gfTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfV0uY29uY2F0KGZvcm11bGEpXG4gICAgICB9IDoge1xuICAgICAgICBuYW1lOiBtb2RlbC5kYXRhTmFtZShMQVlPVVQpLFxuICAgICAgICB2YWx1ZXM6IFt7fV0sXG4gICAgICAgIHRyYW5zZm9ybTogZm9ybXVsYVxuICAgICAgfVxuICAgIF07XG4gIH1cbiAgLy8gRklYTUU6IGltcGxlbWVudFxuICAvLyBvdGhlcndpc2UsIHdlIG5lZWQgdG8gam9pbiB3aWR0aCBhbmQgaGVpZ2h0IChjcm9zcylcbn1cblxuLy8gRklYTUU6IGZvciBuZXN0aW5nIHggYW5kIHksIHdlIG5lZWQgdG8gZGVjbGFyZSB4LHkgbGF5b3V0IHNlcGFyYXRlbHkgYmVmb3JlIGpvaW5pbmcgbGF0ZXJcbi8vIEZvciBub3csIGxldCdzIGFsd2F5cyBhc3N1bWUgc2hhcmVkIHNjYWxlXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VVbml0TGF5b3V0KG1vZGVsOiBVbml0TW9kZWwpOiBMYXlvdXRDb21wb25lbnQge1xuICByZXR1cm4ge1xuICAgIHdpZHRoOiBwYXJzZVVuaXRTaXplTGF5b3V0KG1vZGVsLCBYKSxcbiAgICBoZWlnaHQ6IHBhcnNlVW5pdFNpemVMYXlvdXQobW9kZWwsIFkpXG4gIH07XG59XG5cbmZ1bmN0aW9uIHBhcnNlVW5pdFNpemVMYXlvdXQobW9kZWw6IFVuaXRNb2RlbCwgY2hhbm5lbDogQ2hhbm5lbCk6IFNpemVDb21wb25lbnQge1xuICAvLyBUT0RPOiB0aGluayBhYm91dCB3aGV0aGVyIHRoaXMgY29uZmlnIGhhcyB0byBiZSB0aGUgY2VsbCBvciBmYWNldCBjZWxsIGNvbmZpZ1xuICBjb25zdCBjZWxsQ29uZmlnID0gbW9kZWwuY29uZmlnKCkuY2VsbDtcbiAgY29uc3Qgbm9uT3JkaW5hbFNpemUgPSBjaGFubmVsID09PSBYID8gY2VsbENvbmZpZy53aWR0aCA6IGNlbGxDb25maWcuaGVpZ2h0O1xuXG4gIHJldHVybiB7XG4gICAgZGlzdGluY3Q6IGdldERpc3RpbmN0KG1vZGVsLCBjaGFubmVsKSxcbiAgICBmb3JtdWxhOiBbe1xuICAgICAgZmllbGQ6IG1vZGVsLmNoYW5uZWxTaXplTmFtZShjaGFubmVsKSxcbiAgICAgIGV4cHI6IHVuaXRTaXplRXhwcihtb2RlbCwgY2hhbm5lbCwgbm9uT3JkaW5hbFNpemUpXG4gICAgfV1cbiAgfTtcbn1cblxuZnVuY3Rpb24gdW5pdFNpemVFeHByKG1vZGVsOiBVbml0TW9kZWwsIGNoYW5uZWw6IENoYW5uZWwsIG5vbk9yZGluYWxTaXplOiBudW1iZXIpOiBzdHJpbmcge1xuICBpZiAobW9kZWwuc2NhbGUoY2hhbm5lbCkgIT09IG51bGwpIHtcbiAgICBpZiAobW9kZWwuaXNPcmRpbmFsU2NhbGUoY2hhbm5lbCkpIHtcbiAgICAgIGNvbnN0IHNjYWxlID0gbW9kZWwuc2NhbGUoY2hhbm5lbCk7XG4gICAgICByZXR1cm4gJygnICsgY2FyZGluYWxpdHlGb3JtdWxhKG1vZGVsLCBjaGFubmVsKSArXG4gICAgICAgICcgKyAnICsgc2NhbGUucGFkZGluZyArXG4gICAgICAgICcpICogJyArIHNjYWxlLmJhbmRTaXplO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbm9uT3JkaW5hbFNpemUgKyAnJztcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKG1vZGVsLm1hcmsoKSA9PT0gVEVYVF9NQVJLICYmIGNoYW5uZWwgPT09IFgpIHtcbiAgICAgIC8vIGZvciB0ZXh0IHRhYmxlIHdpdGhvdXQgeC95IHNjYWxlIHdlIG5lZWQgd2lkZXIgYmFuZFNpemVcbiAgICAgIHJldHVybiBtb2RlbC5jb25maWcoKS5zY2FsZS50ZXh0QmFuZFdpZHRoICsgJyc7XG4gICAgfVxuICAgIHJldHVybiBtb2RlbC5jb25maWcoKS5zY2FsZS5iYW5kU2l6ZSArICcnO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUZhY2V0TGF5b3V0KG1vZGVsOiBGYWNldE1vZGVsKTogTGF5b3V0Q29tcG9uZW50IHtcbiAgcmV0dXJuIHtcbiAgICB3aWR0aDogcGFyc2VGYWNldFNpemVMYXlvdXQobW9kZWwsIENPTFVNTiksXG4gICAgaGVpZ2h0OiBwYXJzZUZhY2V0U2l6ZUxheW91dChtb2RlbCwgUk9XKVxuICB9O1xufVxuXG5mdW5jdGlvbiBwYXJzZUZhY2V0U2l6ZUxheW91dChtb2RlbDogRmFjZXRNb2RlbCwgY2hhbm5lbDogQ2hhbm5lbCk6IFNpemVDb21wb25lbnQge1xuICBjb25zdCBjaGlsZExheW91dENvbXBvbmVudCA9IG1vZGVsLmNoaWxkKCkuY29tcG9uZW50LmxheW91dDtcbiAgY29uc3Qgc2l6ZVR5cGUgPSBjaGFubmVsID09PSBST1cgPyAnaGVpZ2h0JyA6ICd3aWR0aCc7XG4gIGNvbnN0IGNoaWxkU2l6ZUNvbXBvbmVudDogU2l6ZUNvbXBvbmVudCA9IGNoaWxkTGF5b3V0Q29tcG9uZW50W3NpemVUeXBlXTtcblxuICBpZiAodHJ1ZSkgeyAvLyBhc3N1bWUgc2hhcmVkIHNjYWxlXG4gICAgLy8gRm9yIHNoYXJlZCBzY2FsZSwgd2UgY2FuIHNpbXBseSBtZXJnZSB0aGUgbGF5b3V0IGludG8gb25lIGRhdGEgc291cmNlXG5cbiAgICBjb25zdCBkaXN0aW5jdCA9IGV4dGVuZChnZXREaXN0aW5jdChtb2RlbCwgY2hhbm5lbCksIGNoaWxkU2l6ZUNvbXBvbmVudC5kaXN0aW5jdCk7XG4gICAgY29uc3QgZm9ybXVsYSA9IGNoaWxkU2l6ZUNvbXBvbmVudC5mb3JtdWxhLmNvbmNhdChbe1xuICAgICAgZmllbGQ6IG1vZGVsLmNoYW5uZWxTaXplTmFtZShjaGFubmVsKSxcbiAgICAgIGV4cHI6IGZhY2V0U2l6ZUZvcm11bGEobW9kZWwsIGNoYW5uZWwsIG1vZGVsLmNoaWxkKCkuY2hhbm5lbFNpemVOYW1lKGNoYW5uZWwpKVxuICAgIH1dKTtcblxuICAgIGRlbGV0ZSBjaGlsZExheW91dENvbXBvbmVudFtzaXplVHlwZV07XG4gICAgcmV0dXJuIHtcbiAgICAgIGRpc3RpbmN0OiBkaXN0aW5jdCxcbiAgICAgIGZvcm11bGE6IGZvcm11bGFcbiAgICB9O1xuICB9XG4gIC8vIEZJWE1FIGltcGxlbWVudCBpbmRlcGVuZGVudCBzY2FsZSBhcyB3ZWxsXG4gIC8vIFRPRE86IC0gYWxzbyBjb25zaWRlciB3aGVuIGNoaWxkcmVuIGhhdmUgZGlmZmVyZW50IGRhdGEgc291cmNlXG59XG5cbmZ1bmN0aW9uIGZhY2V0U2l6ZUZvcm11bGEobW9kZWw6IE1vZGVsLCBjaGFubmVsOiBDaGFubmVsLCBpbm5lclNpemU6IHN0cmluZykge1xuICBjb25zdCBzY2FsZSA9IG1vZGVsLnNjYWxlKGNoYW5uZWwpO1xuICBpZiAobW9kZWwuaGFzKGNoYW5uZWwpKSB7XG4gICAgcmV0dXJuICcoZGF0dW0uJyArIGlubmVyU2l6ZSArICcgKyAnICsgc2NhbGUucGFkZGluZyArICcpJyArICcgKiAnICsgY2FyZGluYWxpdHlGb3JtdWxhKG1vZGVsLCBjaGFubmVsKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJ2RhdHVtLicgKyBpbm5lclNpemUgKyAnICsgJyArIG1vZGVsLmNvbmZpZygpLmZhY2V0LnNjYWxlLnBhZGRpbmc7IC8vIG5lZWQgdG8gYWRkIG91dGVyIHBhZGRpbmcgZm9yIGZhY2V0XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTGF5ZXJMYXlvdXQobW9kZWw6IExheWVyTW9kZWwpOiBMYXlvdXRDb21wb25lbnQge1xuICByZXR1cm4ge1xuICAgIHdpZHRoOiBwYXJzZUxheWVyU2l6ZUxheW91dChtb2RlbCwgWCksXG4gICAgaGVpZ2h0OiBwYXJzZUxheWVyU2l6ZUxheW91dChtb2RlbCwgWSlcbiAgfTtcbn1cblxuZnVuY3Rpb24gcGFyc2VMYXllclNpemVMYXlvdXQobW9kZWw6IExheWVyTW9kZWwsIGNoYW5uZWw6IENoYW5uZWwpOiBTaXplQ29tcG9uZW50IHtcbiAgaWYgKHRydWUpIHtcbiAgICAvLyBGb3Igc2hhcmVkIHNjYWxlLCB3ZSBjYW4gc2ltcGx5IG1lcmdlIHRoZSBsYXlvdXQgaW50byBvbmUgZGF0YSBzb3VyY2VcbiAgICAvLyBUT0RPOiBkb24ndCBqdXN0IHRha2UgdGhlIGxheW91dCBmcm9tIHRoZSBmaXJzdCBjaGlsZFxuXG4gICAgY29uc3QgY2hpbGRMYXlvdXRDb21wb25lbnQgPSBtb2RlbC5jaGlsZHJlbigpWzBdLmNvbXBvbmVudC5sYXlvdXQ7XG4gICAgY29uc3Qgc2l6ZVR5cGUgPSBjaGFubmVsID09PSBZID8gJ2hlaWdodCcgOiAnd2lkdGgnO1xuICAgIGNvbnN0IGNoaWxkU2l6ZUNvbXBvbmVudDogU2l6ZUNvbXBvbmVudCA9IGNoaWxkTGF5b3V0Q29tcG9uZW50W3NpemVUeXBlXTtcblxuICAgIGNvbnN0IGRpc3RpbmN0ID0gY2hpbGRTaXplQ29tcG9uZW50LmRpc3RpbmN0O1xuICAgIGNvbnN0IGZvcm11bGEgPSBbe1xuICAgICAgZmllbGQ6IG1vZGVsLmNoYW5uZWxTaXplTmFtZShjaGFubmVsKSxcbiAgICAgIGV4cHI6IGNoaWxkU2l6ZUNvbXBvbmVudC5mb3JtdWxhWzBdLmV4cHJcbiAgICB9XTtcblxuICAgIG1vZGVsLmNoaWxkcmVuKCkuZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgIGRlbGV0ZSBjaGlsZC5jb21wb25lbnQubGF5b3V0W3NpemVUeXBlXTtcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICBkaXN0aW5jdDogZGlzdGluY3QsXG4gICAgICBmb3JtdWxhOiBmb3JtdWxhXG4gICAgfTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXREaXN0aW5jdChtb2RlbDogTW9kZWwsIGNoYW5uZWw6IENoYW5uZWwpOiBTdHJpbmdTZXQge1xuICBpZiAobW9kZWwuaGFzKGNoYW5uZWwpICYmIG1vZGVsLmlzT3JkaW5hbFNjYWxlKGNoYW5uZWwpKSB7XG4gICAgY29uc3Qgc2NhbGUgPSBtb2RlbC5zY2FsZShjaGFubmVsKTtcbiAgICBpZiAoc2NhbGUudHlwZSA9PT0gU2NhbGVUeXBlLk9SRElOQUwgJiYgIShzY2FsZS5kb21haW4gaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgIC8vIGlmIGV4cGxpY2l0IGRvbWFpbiBpcyBkZWNsYXJlZCwgdXNlIGFycmF5IGxlbmd0aFxuICAgICAgY29uc3QgZGlzdGluY3RGaWVsZCA9IG1vZGVsLmZpZWxkKGNoYW5uZWwpO1xuICAgICAgbGV0IGRpc3RpbmN0OiBTdHJpbmdTZXQgPSB7fTtcbiAgICAgIGRpc3RpbmN0W2Rpc3RpbmN0RmllbGRdID0gdHJ1ZTtcbiAgICAgIHJldHVybiBkaXN0aW5jdDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHt9O1xufVxuXG4vLyBUT0RPOiByZW5hbWUgdG8gY2FyZGluYWxpdHlFeHByXG5mdW5jdGlvbiBjYXJkaW5hbGl0eUZvcm11bGEobW9kZWw6IE1vZGVsLCBjaGFubmVsOiBDaGFubmVsKSB7XG4gIGNvbnN0IHNjYWxlID0gbW9kZWwuc2NhbGUoY2hhbm5lbCk7XG4gIGlmIChzY2FsZS5kb21haW4gaW5zdGFuY2VvZiBBcnJheSkge1xuICAgIHJldHVybiBzY2FsZS5kb21haW4ubGVuZ3RoO1xuICB9XG5cbiAgY29uc3QgdGltZVVuaXQgPSBtb2RlbC5maWVsZERlZihjaGFubmVsKS50aW1lVW5pdDtcbiAgY29uc3QgdGltZVVuaXREb21haW4gPSB0aW1lVW5pdCA/IHJhd0RvbWFpbih0aW1lVW5pdCwgY2hhbm5lbCkgOiBudWxsO1xuXG4gIHJldHVybiB0aW1lVW5pdERvbWFpbiAhPT0gbnVsbCA/IHRpbWVVbml0RG9tYWluLmxlbmd0aCA6XG4gICAgICAgIG1vZGVsLmZpZWxkKGNoYW5uZWwsIHtkYXR1bTogdHJ1ZSwgcHJlZm46ICdkaXN0aW5jdF8nfSk7XG59XG4iLCJpbXBvcnQge0NPTE9SLCBTSVpFLCBTSEFQRSwgQ2hhbm5lbH0gZnJvbSAnLi4vY2hhbm5lbCc7XG5pbXBvcnQge0ZpZWxkRGVmfSBmcm9tICcuLi9maWVsZGRlZic7XG5pbXBvcnQge0xlZ2VuZH0gZnJvbSAnLi4vbGVnZW5kJztcbmltcG9ydCB7dGl0bGUgYXMgZmllbGRUaXRsZX0gZnJvbSAnLi4vZmllbGRkZWYnO1xuaW1wb3J0IHtBUkVBLCBCQVIsIFRJQ0ssIFRFWFQsIExJTkUsIFBPSU5ULCBDSVJDTEUsIFNRVUFSRX0gZnJvbSAnLi4vbWFyayc7XG5pbXBvcnQge09SRElOQUx9IGZyb20gJy4uL3R5cGUnO1xuaW1wb3J0IHtleHRlbmQsIGtleXMsIHdpdGhvdXQsIERpY3R9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQge2FwcGx5TWFya0NvbmZpZywgRklMTF9TVFJPS0VfQ09ORklHLCBmb3JtYXRNaXhpbnMgYXMgdXRpbEZvcm1hdE1peGluc30gZnJvbSAnLi9jb21tb24nO1xuaW1wb3J0IHtmb3JtYXQgYXMgdGltZUZvcm1hdH0gZnJvbSAnLi4vdGltZXVuaXQnO1xuaW1wb3J0IHtDT0xPUl9MRUdFTkQsIENPTE9SX0xFR0VORF9MQUJFTH0gZnJvbSAnLi9zY2FsZSc7XG5pbXBvcnQge1VuaXRNb2RlbH0gZnJvbSAnLi91bml0JztcbmltcG9ydCB7VmdMZWdlbmR9IGZyb20gJy4uL3ZlZ2Euc2NoZW1hJztcblxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VMZWdlbmRDb21wb25lbnQobW9kZWw6IFVuaXRNb2RlbCk6IERpY3Q8VmdMZWdlbmQ+IHtcbiAgcmV0dXJuIFtDT0xPUiwgU0laRSwgU0hBUEVdLnJlZHVjZShmdW5jdGlvbihsZWdlbmRDb21wb25lbnQsIGNoYW5uZWwpIHtcbiAgICBpZiAobW9kZWwubGVnZW5kKGNoYW5uZWwpKSB7XG4gICAgICBsZWdlbmRDb21wb25lbnRbY2hhbm5lbF0gPSBwYXJzZUxlZ2VuZChtb2RlbCwgY2hhbm5lbCk7XG4gICAgfVxuICAgIHJldHVybiBsZWdlbmRDb21wb25lbnQ7XG4gIH0sIHt9IGFzIERpY3Q8VmdMZWdlbmQ+KTtcbn1cblxuZnVuY3Rpb24gZ2V0TGVnZW5kRGVmV2l0aFNjYWxlKG1vZGVsOiBVbml0TW9kZWwsIGNoYW5uZWw6IENoYW5uZWwpOiBWZ0xlZ2VuZCB7XG4gIHN3aXRjaCAoY2hhbm5lbCkge1xuICAgIGNhc2UgQ09MT1I6XG4gICAgICBjb25zdCBmaWVsZERlZiA9IG1vZGVsLmZpZWxkRGVmKENPTE9SKTtcbiAgICAgIGNvbnN0IHNjYWxlID0gbW9kZWwuc2NhbGVOYW1lKHVzZUNvbG9yTGVnZW5kU2NhbGUoZmllbGREZWYpID9cbiAgICAgICAgLy8gVG8gcHJvZHVjZSBvcmRpbmFsIGxlZ2VuZCAobGlzdCwgcmF0aGVyIHRoYW4gbGluZWFyIHJhbmdlKSB3aXRoIGNvcnJlY3QgbGFiZWxzOlxuICAgICAgICAvLyAtIEZvciBhbiBvcmRpbmFsIGZpZWxkLCBwcm92aWRlIGFuIG9yZGluYWwgc2NhbGUgdGhhdCBtYXBzIHJhbmsgdmFsdWVzIHRvIGZpZWxkIHZhbHVlc1xuICAgICAgICAvLyAtIEZvciBhIGZpZWxkIHdpdGggYmluIG9yIHRpbWVVbml0LCBwcm92aWRlIGFuIGlkZW50aXR5IG9yZGluYWwgc2NhbGVcbiAgICAgICAgLy8gKG1hcHBpbmcgdGhlIGZpZWxkIHZhbHVlcyB0byB0aGVtc2VsdmVzKVxuICAgICAgICBDT0xPUl9MRUdFTkQgOlxuICAgICAgICBDT0xPUlxuICAgICAgKTtcblxuICAgICAgcmV0dXJuIG1vZGVsLmNvbmZpZygpLm1hcmsuZmlsbGVkID8geyBmaWxsOiBzY2FsZSB9IDogeyBzdHJva2U6IHNjYWxlIH07XG4gICAgY2FzZSBTSVpFOlxuICAgICAgcmV0dXJuIHsgc2l6ZTogbW9kZWwuc2NhbGVOYW1lKFNJWkUpIH07XG4gICAgY2FzZSBTSEFQRTpcbiAgICAgIHJldHVybiB7IHNoYXBlOiBtb2RlbC5zY2FsZU5hbWUoU0hBUEUpIH07XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUxlZ2VuZChtb2RlbDogVW5pdE1vZGVsLCBjaGFubmVsOiBDaGFubmVsKTogVmdMZWdlbmQge1xuICBjb25zdCBmaWVsZERlZiA9IG1vZGVsLmZpZWxkRGVmKGNoYW5uZWwpO1xuICBjb25zdCBsZWdlbmQgPSBtb2RlbC5sZWdlbmQoY2hhbm5lbCk7XG5cbiAgbGV0IGRlZjogVmdMZWdlbmQgPSBnZXRMZWdlbmREZWZXaXRoU2NhbGUobW9kZWwsIGNoYW5uZWwpO1xuXG4gIC8vIDEuMSBBZGQgcHJvcGVydGllcyB3aXRoIHNwZWNpYWwgcnVsZXNcbiAgZGVmLnRpdGxlID0gdGl0bGUobGVnZW5kLCBmaWVsZERlZik7XG5cbiAgZGVmLm9mZnNldCA9IG9mZnNldChsZWdlbmQsIGZpZWxkRGVmKTtcblxuICBleHRlbmQoZGVmLCBmb3JtYXRNaXhpbnMobGVnZW5kLCBtb2RlbCwgY2hhbm5lbCkpO1xuXG4gIC8vIDEuMiBBZGQgcHJvcGVydGllcyB3aXRob3V0IHJ1bGVzXG4gIFsnb3JpZW50JywgJ3ZhbHVlcyddLmZvckVhY2goZnVuY3Rpb24ocHJvcGVydHkpIHtcbiAgICBjb25zdCB2YWx1ZSA9IGxlZ2VuZFtwcm9wZXJ0eV07XG4gICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGRlZltwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIDIpIEFkZCBtYXJrIHByb3BlcnR5IGRlZmluaXRpb24gZ3JvdXBzXG4gIGNvbnN0IHByb3BzID0gKHR5cGVvZiBsZWdlbmQgIT09ICdib29sZWFuJyAmJiBsZWdlbmQucHJvcGVydGllcykgfHwge307XG4gIFsndGl0bGUnLCAnc3ltYm9scycsICdsZWdlbmQnLCAnbGFiZWxzJ10uZm9yRWFjaChmdW5jdGlvbihncm91cCkge1xuICAgIGxldCB2YWx1ZSA9IHByb3BlcnRpZXNbZ3JvdXBdID9cbiAgICAgIHByb3BlcnRpZXNbZ3JvdXBdKGZpZWxkRGVmLCBwcm9wc1tncm91cF0sIG1vZGVsLCBjaGFubmVsKSA6IC8vIGFwcGx5IHJ1bGVcbiAgICAgIHByb3BzW2dyb3VwXTsgLy8gbm8gcnVsZSAtLSBqdXN0IGRlZmF1bHQgdmFsdWVzXG4gICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQgJiYga2V5cyh2YWx1ZSkubGVuZ3RoID4gMCkge1xuICAgICAgZGVmLnByb3BlcnRpZXMgPSBkZWYucHJvcGVydGllcyB8fCB7fTtcbiAgICAgIGRlZi5wcm9wZXJ0aWVzW2dyb3VwXSA9IHZhbHVlO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGRlZjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9mZnNldChsZWdlbmQ6IExlZ2VuZCwgZmllbGREZWY6IEZpZWxkRGVmKSB7XG4gIGlmIChsZWdlbmQub2Zmc2V0ICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gbGVnZW5kLm9mZnNldDtcbiAgfVxuICByZXR1cm4gMDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9yaWVudChsZWdlbmQ6IExlZ2VuZCwgZmllbGREZWY6IEZpZWxkRGVmKSB7XG4gIGNvbnN0IG9yaWVudCA9IGxlZ2VuZC5vcmllbnQ7XG4gIGlmIChvcmllbnQpIHtcbiAgICByZXR1cm4gb3JpZW50O1xuICB9XG4gIHJldHVybiAndmVydGljYWwnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdGl0bGUobGVnZW5kOiBMZWdlbmQsIGZpZWxkRGVmOiBGaWVsZERlZikge1xuICBpZiAodHlwZW9mIGxlZ2VuZCAhPT0gJ2Jvb2xlYW4nICYmIGxlZ2VuZC50aXRsZSkge1xuICAgIHJldHVybiBsZWdlbmQudGl0bGU7XG4gIH1cblxuICByZXR1cm4gZmllbGRUaXRsZShmaWVsZERlZik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRNaXhpbnMobGVnZW5kOiBMZWdlbmQsIG1vZGVsOiBVbml0TW9kZWwsIGNoYW5uZWw6IENoYW5uZWwpIHtcbiAgY29uc3QgZmllbGREZWYgPSBtb2RlbC5maWVsZERlZihjaGFubmVsKTtcblxuICAvLyBJZiB0aGUgY2hhbm5lbCBpcyBiaW5uZWQsIHdlIHNob3VsZCBub3Qgc2V0IHRoZSBmb3JtYXQgYmVjYXVzZSB3ZSBoYXZlIGEgcmFuZ2UgbGFiZWxcbiAgaWYgKGZpZWxkRGVmLmJpbikge1xuICAgIHJldHVybiB7fTtcbiAgfVxuXG4gIHJldHVybiB1dGlsRm9ybWF0TWl4aW5zKG1vZGVsLCBmaWVsZERlZixcbiAgICB0eXBlb2YgbGVnZW5kICE9PSAnYm9vbGVhbicgPyBsZWdlbmQuZm9ybWF0IDogdW5kZWZpbmVkLFxuICAgIG1vZGVsLmxlZ2VuZChjaGFubmVsKS5zaG9ydFRpbWVMYWJlbHMpO1xufVxuXG4vLyB3ZSBoYXZlIHRvIHVzZSBzcGVjaWFsIHNjYWxlcyBmb3Igb3JkaW5hbCBvciBiaW5uZWQgZmllbGRzIGZvciB0aGUgY29sb3IgY2hhbm5lbFxuZXhwb3J0IGZ1bmN0aW9uIHVzZUNvbG9yTGVnZW5kU2NhbGUoZmllbGREZWY6IEZpZWxkRGVmKSB7XG4gIHJldHVybiBmaWVsZERlZi50eXBlID09PSBPUkRJTkFMIHx8IGZpZWxkRGVmLmJpbiB8fCBmaWVsZERlZi50aW1lVW5pdDtcbn1cblxuZXhwb3J0IG5hbWVzcGFjZSBwcm9wZXJ0aWVzIHtcbiAgZXhwb3J0IGZ1bmN0aW9uIHN5bWJvbHMoZmllbGREZWY6IEZpZWxkRGVmLCBzeW1ib2xzU3BlYywgbW9kZWw6IFVuaXRNb2RlbCwgY2hhbm5lbDogQ2hhbm5lbCkge1xuICAgIGxldCBzeW1ib2xzOmFueSA9IHt9O1xuICAgIGNvbnN0IG1hcmsgPSBtb2RlbC5tYXJrKCk7XG4gICAgY29uc3QgbGVnZW5kID0gbW9kZWwubGVnZW5kKGNoYW5uZWwpO1xuXG4gICAgc3dpdGNoIChtYXJrKSB7XG4gICAgICBjYXNlIEJBUjpcbiAgICAgIGNhc2UgVElDSzpcbiAgICAgIGNhc2UgVEVYVDpcbiAgICAgICAgc3ltYm9scy5zaGFwZSA9IHt2YWx1ZTogJ3NxdWFyZSd9O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQ0lSQ0xFOlxuICAgICAgY2FzZSBTUVVBUkU6XG4gICAgICAgIHN5bWJvbHMuc2hhcGUgPSB7IHZhbHVlOiBtYXJrIH07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBQT0lOVDpcbiAgICAgIGNhc2UgTElORTpcbiAgICAgIGNhc2UgQVJFQTpcbiAgICAgICAgLy8gdXNlIGRlZmF1bHQgY2lyY2xlXG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbGxlZCA9IG1vZGVsLmNvbmZpZygpLm1hcmsuZmlsbGVkO1xuXG5cbiAgICBsZXQgY29uZmlnID0gY2hhbm5lbCA9PT0gQ09MT1IgP1xuICAgICAgICAvKiBGb3IgY29sb3IncyBsZWdlbmQsIGRvIG5vdCBzZXQgZmlsbCAod2hlbiBmaWxsZWQpIG9yIHN0cm9rZSAod2hlbiB1bmZpbGxlZCkgcHJvcGVydHkgZnJvbSBjb25maWcgYmVjYXVzZSB0aGUgdGhlIGxlZ2VuZCdzIGBmaWxsYCBvciBgc3Ryb2tlYCBzY2FsZSBzaG91bGQgaGF2ZSBwcmVjZWRlbmNlICovXG4gICAgICAgIHdpdGhvdXQoRklMTF9TVFJPS0VfQ09ORklHLCBbIGZpbGxlZCA/ICdmaWxsJyA6ICdzdHJva2UnLCAnc3Ryb2tlRGFzaCcsICdzdHJva2VEYXNoT2Zmc2V0J10pIDpcbiAgICAgICAgLyogRm9yIG90aGVyIGxlZ2VuZCwgbm8gbmVlZCB0byBvbWl0LiAqL1xuICAgICAgICAgd2l0aG91dChGSUxMX1NUUk9LRV9DT05GSUcsIFsnc3Ryb2tlRGFzaCcsICdzdHJva2VEYXNoT2Zmc2V0J10pO1xuXG4gICAgY29uZmlnID0gd2l0aG91dChjb25maWcsIFsnc3Ryb2tlRGFzaCcsICdzdHJva2VEYXNoT2Zmc2V0J10pO1xuXG4gICAgYXBwbHlNYXJrQ29uZmlnKHN5bWJvbHMsIG1vZGVsLCBjb25maWcpO1xuXG4gICAgaWYgKGZpbGxlZCkge1xuICAgICAgc3ltYm9scy5zdHJva2VXaWR0aCA9IHsgdmFsdWU6IDAgfTtcbiAgICB9XG5cbiAgICBsZXQgdmFsdWU7XG4gICAgaWYgKG1vZGVsLmhhcyhDT0xPUikgJiYgY2hhbm5lbCA9PT0gQ09MT1IpIHtcbiAgICAgIGlmICh1c2VDb2xvckxlZ2VuZFNjYWxlKGZpZWxkRGVmKSkge1xuICAgICAgICAvLyBmb3IgY29sb3IgbGVnZW5kIHNjYWxlLCB3ZSBuZWVkIHRvIG92ZXJyaWRlXG4gICAgICAgIHZhbHVlID0geyBzY2FsZTogbW9kZWwuc2NhbGVOYW1lKENPTE9SKSwgZmllbGQ6ICdkYXRhJyB9O1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAobW9kZWwuZmllbGREZWYoQ09MT1IpLnZhbHVlKSB7XG4gICAgICB2YWx1ZSA9IHsgdmFsdWU6IG1vZGVsLmZpZWxkRGVmKENPTE9SKS52YWx1ZSB9O1xuICAgIH1cblxuICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBhcHBseSB0aGUgdmFsdWVcbiAgICAgIGlmIChmaWxsZWQpIHtcbiAgICAgICAgc3ltYm9scy5maWxsID0gdmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzeW1ib2xzLnN0cm9rZSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoY2hhbm5lbCAhPT0gQ09MT1IpIHtcbiAgICAgIC8vIEZvciBub24tY29sb3IgbGVnZW5kLCBhcHBseSBjb2xvciBjb25maWcgaWYgdGhlcmUgaXMgbm8gZmlsbCAvIHN0cm9rZSBjb25maWcuXG4gICAgICAvLyAoRm9yIGNvbG9yLCBkbyBub3Qgb3ZlcnJpZGUgc2NhbGUgc3BlY2lmaWVkISlcbiAgICAgIHN5bWJvbHNbZmlsbGVkID8gJ2ZpbGwnIDogJ3N0cm9rZSddID0gc3ltYm9sc1tmaWxsZWQgPyAnZmlsbCcgOiAnc3Ryb2tlJ10gfHxcbiAgICAgICAge3ZhbHVlOiBtb2RlbC5jb25maWcoKS5tYXJrLmNvbG9yfTtcbiAgICB9XG5cbiAgICBpZiAobGVnZW5kLnN5bWJvbENvbG9yICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHN5bWJvbHMuZmlsbCA9IHt2YWx1ZTogbGVnZW5kLnN5bWJvbENvbG9yfTtcbiAgICB9XG5cbiAgICBpZiAobGVnZW5kLnN5bWJvbFNoYXBlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHN5bWJvbHMuc2hhcGUgPSB7dmFsdWU6IGxlZ2VuZC5zeW1ib2xTaGFwZX07XG4gICAgfVxuXG4gICAgaWYgKGxlZ2VuZC5zeW1ib2xTaXplICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHN5bWJvbHMuc2l6ZSA9IHt2YWx1ZTogbGVnZW5kLnN5bWJvbFNpemV9O1xuICAgIH1cblxuICAgIGlmIChsZWdlbmQuc3ltYm9sU3Ryb2tlV2lkdGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgc3ltYm9scy5zdHJva2VXaWR0aCA9IHt2YWx1ZTogbGVnZW5kLnN5bWJvbFN0cm9rZVdpZHRofTtcbiAgICB9XG5cbiAgICBzeW1ib2xzID0gZXh0ZW5kKHN5bWJvbHMsIHN5bWJvbHNTcGVjIHx8IHt9KTtcblxuICAgIHJldHVybiBrZXlzKHN5bWJvbHMpLmxlbmd0aCA+IDAgPyBzeW1ib2xzIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIGxhYmVscyhmaWVsZERlZjogRmllbGREZWYsIGxhYmVsc1NwZWMsIG1vZGVsOiBVbml0TW9kZWwsIGNoYW5uZWw6IENoYW5uZWwpIHtcbiAgICBjb25zdCBsZWdlbmQgPSBtb2RlbC5sZWdlbmQoY2hhbm5lbCk7XG5cbiAgICBsZXQgbGFiZWxzOmFueSA9IHt9O1xuXG4gICAgaWYgKGNoYW5uZWwgPT09IENPTE9SKSB7XG4gICAgICBpZiAoZmllbGREZWYudHlwZSA9PT0gT1JESU5BTCkge1xuICAgICAgICBsYWJlbHNTcGVjID0gZXh0ZW5kKHtcbiAgICAgICAgICB0ZXh0OiB7XG4gICAgICAgICAgICBzY2FsZTogbW9kZWwuc2NhbGVOYW1lKENPTE9SX0xFR0VORCksXG4gICAgICAgICAgICBmaWVsZDogJ2RhdGEnXG4gICAgICAgICAgfVxuICAgICAgICB9LCBsYWJlbHNTcGVjIHx8IHt9KTtcbiAgICAgIH0gZWxzZSBpZiAoZmllbGREZWYuYmluKSB7XG4gICAgICAgIGxhYmVsc1NwZWMgPSBleHRlbmQoe1xuICAgICAgICAgIHRleHQ6IHtcbiAgICAgICAgICAgIHNjYWxlOiBtb2RlbC5zY2FsZU5hbWUoQ09MT1JfTEVHRU5EX0xBQkVMKSxcbiAgICAgICAgICAgIGZpZWxkOiAnZGF0YSdcbiAgICAgICAgICB9XG4gICAgICAgIH0sIGxhYmVsc1NwZWMgfHwge30pO1xuICAgICAgfSBlbHNlIGlmIChmaWVsZERlZi50aW1lVW5pdCkge1xuICAgICAgICBsYWJlbHNTcGVjID0gZXh0ZW5kKHtcbiAgICAgICAgICB0ZXh0OiB7XG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ3t7IGRhdHVtLmRhdGEgfCB0aW1lOlxcJycgKyB0aW1lRm9ybWF0KGZpZWxkRGVmLnRpbWVVbml0LCBsZWdlbmQuc2hvcnRUaW1lTGFiZWxzKSArICdcXCd9fSdcbiAgICAgICAgICB9XG4gICAgICAgIH0sIGxhYmVsc1NwZWMgfHwge30pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChsZWdlbmQubGFiZWxBbGlnbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBsYWJlbHMuYWxpZ24gPSB7dmFsdWU6IGxlZ2VuZC5sYWJlbEFsaWdufTtcbiAgICB9XG5cbiAgICBpZiAobGVnZW5kLmxhYmVsQ29sb3IgIT09IHVuZGVmaW5lZCkge1xuICAgICAgbGFiZWxzLnN0cm9rZSA9IHt2YWx1ZTogbGVnZW5kLmxhYmVsQ29sb3J9O1xuICAgIH1cblxuICAgIGlmIChsZWdlbmQubGFiZWxGb250ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGxhYmVscy5mb250ID0ge3ZhbHVlOiBsZWdlbmQubGFiZWxGb250fTtcbiAgICB9XG5cbiAgICBpZiAobGVnZW5kLmxhYmVsRm9udFNpemUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgbGFiZWxzLmZvbnRTaXplID0ge3ZhbHVlOiBsZWdlbmQubGFiZWxGb250U2l6ZX07XG4gICAgfVxuXG4gICAgaWYgKGxlZ2VuZC5sYWJlbEJhc2VsaW5lICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGxhYmVscy5iYXNlbGluZSA9IHt2YWx1ZTogbGVnZW5kLmxhYmVsQmFzZWxpbmV9O1xuICAgIH1cblxuICAgIGxhYmVscyA9IGV4dGVuZChsYWJlbHMsIGxhYmVsc1NwZWMgfHwge30pO1xuXG4gICAgcmV0dXJuIGtleXMobGFiZWxzKS5sZW5ndGggPiAwID8gbGFiZWxzIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIHRpdGxlKGZpZWxkRGVmOiBGaWVsZERlZiwgdGl0bGVTcGVjLCBtb2RlbDogVW5pdE1vZGVsLCBjaGFubmVsOiBDaGFubmVsKSB7XG4gICAgY29uc3QgbGVnZW5kID0gbW9kZWwubGVnZW5kKGNoYW5uZWwpO1xuXG4gICAgbGV0IHRpdGxlczphbnkgPSB7fTtcblxuICAgIGlmIChsZWdlbmQudGl0bGVDb2xvciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aXRsZXMuc3Ryb2tlID0ge3ZhbHVlOiBsZWdlbmQudGl0bGVDb2xvcn07XG4gICAgfVxuXG4gICAgaWYgKGxlZ2VuZC50aXRsZUZvbnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGl0bGVzLmZvbnQgPSB7dmFsdWU6IGxlZ2VuZC50aXRsZUZvbnR9O1xuICAgIH1cblxuICAgIGlmIChsZWdlbmQudGl0bGVGb250U2l6ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aXRsZXMuZm9udFNpemUgPSB7dmFsdWU6IGxlZ2VuZC50aXRsZUZvbnRTaXplfTtcbiAgICB9XG5cbiAgICBpZiAobGVnZW5kLnRpdGxlRm9udFdlaWdodCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aXRsZXMuZm9udFdlaWdodCA9IHt2YWx1ZTogbGVnZW5kLnRpdGxlRm9udFdlaWdodH07XG4gICAgfVxuXG4gICAgdGl0bGVzID0gZXh0ZW5kKHRpdGxlcywgdGl0bGVTcGVjIHx8IHt9KTtcblxuICAgIHJldHVybiBrZXlzKHRpdGxlcykubGVuZ3RoID4gMCA/IHRpdGxlcyA6IHVuZGVmaW5lZDtcbiAgfVxufVxuIiwiaW1wb3J0IHtVbml0TW9kZWx9IGZyb20gJy4uL3VuaXQnO1xuaW1wb3J0IHtYLCBZLCBYMiwgWTJ9IGZyb20gJy4uLy4uL2NoYW5uZWwnO1xuaW1wb3J0IHtpc0RpbWVuc2lvbiwgaXNNZWFzdXJlfSBmcm9tICcuLi8uLi9maWVsZGRlZic7XG5pbXBvcnQge2FwcGx5Q29sb3JBbmRPcGFjaXR5LCBhcHBseU1hcmtDb25maWd9IGZyb20gJy4uL2NvbW1vbic7XG5cbmV4cG9ydCBuYW1lc3BhY2UgYXJlYSB7XG4gIGV4cG9ydCBmdW5jdGlvbiBtYXJrVHlwZSgpIHtcbiAgICByZXR1cm4gJ2FyZWEnO1xuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIHByb3BlcnRpZXMobW9kZWw6IFVuaXRNb2RlbCkge1xuICAgIC8vIFRPRE8gVXNlIFZlZ2EncyBtYXJrcyBwcm9wZXJ0aWVzIGludGVyZmFjZVxuICAgIGxldCBwOiBhbnkgPSB7fTtcblxuICAgIGNvbnN0IG9yaWVudCA9IG1vZGVsLmNvbmZpZygpLm1hcmsub3JpZW50O1xuICAgIGlmIChvcmllbnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcC5vcmllbnQgPSB7IHZhbHVlOiBvcmllbnQgfTtcbiAgICB9XG5cbiAgICBjb25zdCBzdGFjayA9IG1vZGVsLnN0YWNrKCk7XG4gICAgY29uc3QgeEZpZWxkRGVmID0gbW9kZWwuZW5jb2RpbmcoKS54O1xuICAgIC8vIHhcbiAgICBpZiAoc3RhY2sgJiYgWCA9PT0gc3RhY2suZmllbGRDaGFubmVsKSB7IC8vIFN0YWNrZWQgTWVhc3VyZVxuICAgICAgcC54ID0ge1xuICAgICAgICBzY2FsZTogbW9kZWwuc2NhbGVOYW1lKFgpLFxuICAgICAgICBmaWVsZDogbW9kZWwuZmllbGQoWCwgeyBzdWZmaXg6ICdfc3RhcnQnIH0pXG4gICAgICB9O1xuICAgICAgaWYgKG9yaWVudCA9PT0gJ2hvcml6b250YWwnKSB7XG4gICAgICAgIHAueDIgPSB7XG4gICAgICAgICAgc2NhbGU6IG1vZGVsLnNjYWxlTmFtZShYKSxcbiAgICAgICAgICBmaWVsZDogbW9kZWwuZmllbGQoWCwgeyBzdWZmaXg6ICdfZW5kJyB9KVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNNZWFzdXJlKHhGaWVsZERlZikpIHsgLy8gTWVhc3VyZVxuICAgICAgaWYgKG9yaWVudCA9PT0gJ2hvcml6b250YWwnKSB7XG4gICAgICAgIC8vIHhcbiAgICAgICAgaWYgKG1vZGVsLmhhcyhYKSkge1xuICAgICAgICAgIHAueCA9IHtcbiAgICAgICAgICAgIHNjYWxlOiBtb2RlbC5zY2FsZU5hbWUoWCksXG4gICAgICAgICAgICBmaWVsZDogbW9kZWwuZmllbGQoWClcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHAueCA9IHtcbiAgICAgICAgICAgIHNjYWxlOiBtb2RlbC5zY2FsZU5hbWUoWCksXG4gICAgICAgICAgICB2YWx1ZTogMFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyB4MlxuICAgICAgICBpZiAobW9kZWwuaGFzKFgyKSkge1xuICAgICAgICAgIHAueDIgPSB7XG4gICAgICAgICAgICBzY2FsZTogbW9kZWwuc2NhbGVOYW1lKFgpLFxuICAgICAgICAgICAgZmllbGQ6IG1vZGVsLmZpZWxkKFgyKVxuICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcC54MiA9IHtcbiAgICAgICAgICAgIHNjYWxlOiBtb2RlbC5zY2FsZU5hbWUoWCksXG4gICAgICAgICAgICB2YWx1ZTogMFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHAueCA9IHtcbiAgICAgICAgICBzY2FsZTogbW9kZWwuc2NhbGVOYW1lKFgpLFxuICAgICAgICAgIGZpZWxkOiBtb2RlbC5maWVsZChYKVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNEaW1lbnNpb24oeEZpZWxkRGVmKSkge1xuICAgICAgcC54ID0ge1xuICAgICAgICBzY2FsZTogbW9kZWwuc2NhbGVOYW1lKFgpLFxuICAgICAgICBmaWVsZDogbW9kZWwuZmllbGQoWCwgeyBiaW5TdWZmaXg6ICdfbWlkJyB9KVxuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyB5XG4gICAgY29uc3QgeUZpZWxkRGVmID0gbW9kZWwuZW5jb2RpbmcoKS55O1xuICAgIGlmIChzdGFjayAmJiBZID09PSBzdGFjay5maWVsZENoYW5uZWwpIHsgLy8gU3RhY2tlZCBNZWFzdXJlXG4gICAgICBwLnkgPSB7XG4gICAgICAgIHNjYWxlOiBtb2RlbC5zY2FsZU5hbWUoWSksXG4gICAgICAgIGZpZWxkOiBtb2RlbC5maWVsZChZLCB7IHN1ZmZpeDogJ19zdGFydCcgfSlcbiAgICAgIH07XG4gICAgICBpZiAob3JpZW50ICE9PSAnaG9yaXpvbnRhbCcpIHtcbiAgICAgICAgcC55MiA9IHtcbiAgICAgICAgICBzY2FsZTogbW9kZWwuc2NhbGVOYW1lKFkpLFxuICAgICAgICAgIGZpZWxkOiBtb2RlbC5maWVsZChZLCB7IHN1ZmZpeDogJ19lbmQnIH0pXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpc01lYXN1cmUoeUZpZWxkRGVmKSkge1xuICAgICAgaWYgKG9yaWVudCAhPT0gJ2hvcml6b250YWwnKSB7XG4gICAgICAgIC8vIHlcbiAgICAgICAgaWYgKG1vZGVsLmhhcyhZKSkge1xuICAgICAgICAgIHAueSA9IHtcbiAgICAgICAgICAgIHNjYWxlOiBtb2RlbC5zY2FsZU5hbWUoWSksXG4gICAgICAgICAgICBmaWVsZDogbW9kZWwuZmllbGQoWSlcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHAueSA9IHsgZmllbGQ6IHsgZ3JvdXA6ICdoZWlnaHQnIH0gfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHkyXG4gICAgICAgIGlmIChtb2RlbC5oYXMoWTIpKSB7XG4gICAgICAgICAgcC55MiA9IHtcbiAgICAgICAgICAgIHNjYWxlOiBtb2RlbC5zY2FsZU5hbWUoWSksXG4gICAgICAgICAgICBmaWVsZDogbW9kZWwuZmllbGQoWTIpXG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwLnkyID0ge1xuICAgICAgICAgICAgc2NhbGU6IG1vZGVsLnNjYWxlTmFtZShZKSxcbiAgICAgICAgICAgIHZhbHVlOiAwXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcC55ID0ge1xuICAgICAgICAgIHNjYWxlOiBtb2RlbC5zY2FsZU5hbWUoWSksXG4gICAgICAgICAgZmllbGQ6IG1vZGVsLmZpZWxkKFkpXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpc0RpbWVuc2lvbih5RmllbGREZWYpKSB7XG4gICAgICBwLnkgPSB7XG4gICAgICAgIHNjYWxlOiBtb2RlbC5zY2FsZU5hbWUoWSksXG4gICAgICAgIGZpZWxkOiBtb2RlbC5maWVsZChZLCB7IGJpblN1ZmZpeDogJ19taWQnIH0pXG4gICAgICB9O1xuICAgIH1cblxuICAgIGFwcGx5Q29sb3JBbmRPcGFjaXR5KHAsIG1vZGVsKTtcbiAgICBhcHBseU1hcmtDb25maWcocCwgbW9kZWwsIFsnaW50ZXJwb2xhdGUnLCAndGVuc2lvbiddKTtcbiAgICByZXR1cm4gcDtcbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiBsYWJlbHMobW9kZWw6IFVuaXRNb2RlbCkge1xuICAgIC8vIFRPRE8oIzI0MCk6IGZpbGwgdGhpcyBtZXRob2RcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG4iLCJpbXBvcnQge1gsIFksIFgyLCBZMiwgU0laRSwgQ2hhbm5lbH0gZnJvbSAnLi4vLi4vY2hhbm5lbCc7XG5pbXBvcnQge2lzTWVhc3VyZX0gZnJvbSAnLi4vLi4vZmllbGRkZWYnO1xuXG5pbXBvcnQge1VuaXRNb2RlbH0gZnJvbSAnLi4vdW5pdCc7XG5pbXBvcnQge2FwcGx5Q29sb3JBbmRPcGFjaXR5fSBmcm9tICcuLi9jb21tb24nO1xuXG5leHBvcnQgbmFtZXNwYWNlIGJhciB7XG4gIGV4cG9ydCBmdW5jdGlvbiBtYXJrVHlwZSgpIHtcbiAgICByZXR1cm4gJ3JlY3QnO1xuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIHByb3BlcnRpZXMobW9kZWw6IFVuaXRNb2RlbCkge1xuICAgIC8vIFRPRE8gVXNlIFZlZ2EncyBtYXJrcyBwcm9wZXJ0aWVzIGludGVyZmFjZVxuICAgIGxldCBwOiBhbnkgPSB7fTtcblxuICAgIGNvbnN0IG9yaWVudCA9IG1vZGVsLmNvbmZpZygpLm1hcmsub3JpZW50O1xuXG4gICAgY29uc3Qgc3RhY2sgPSBtb2RlbC5zdGFjaygpO1xuICAgIGNvbnN0IHhGaWVsZERlZiA9IG1vZGVsLmVuY29kaW5nKCkueDtcbiAgICBjb25zdCB4MkZpZWxkRGVmID0gbW9kZWwuZW5jb2RpbmcoKS54MjtcblxuICAgIGNvbnN0IHhJc01lYXN1cmUgPSBpc01lYXN1cmUoeEZpZWxkRGVmKSB8fCBpc01lYXN1cmUoeDJGaWVsZERlZik7XG5cbiAgICAvLyB4LCB4MiwgYW5kIHdpZHRoIC0tIHdlIG11c3Qgc3BlY2lmeSB0d28gb2YgdGhlc2UgaW4gYWxsIGNvbmRpdGlvbnNcbiAgICBpZiAoc3RhY2sgJiYgWCA9PT0gc3RhY2suZmllbGRDaGFubmVsKSB7XG4gICAgICAvLyAneCcgaXMgYSBzdGFja2VkIG1lYXN1cmUsIHRodXMgdXNlIDxmaWVsZD5fc3RhcnQgYW5kIDxmaWVsZD5fZW5kIGZvciB4LCB4Mi5cbiAgICAgIHAueCA9IHtcbiAgICAgICAgc2NhbGU6IG1vZGVsLnNjYWxlTmFtZShYKSxcbiAgICAgICAgZmllbGQ6IG1vZGVsLmZpZWxkKFgsIHsgc3VmZml4OiAnX3N0YXJ0JyB9KVxuICAgICAgfTtcbiAgICAgIHAueDIgPSB7XG4gICAgICAgIHNjYWxlOiBtb2RlbC5zY2FsZU5hbWUoWCksXG4gICAgICAgIGZpZWxkOiBtb2RlbC5maWVsZChYLCB7IHN1ZmZpeDogJ19lbmQnIH0pXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAoeElzTWVhc3VyZSkge1xuICAgICAgaWYgKG9yaWVudCA9PT0gJ2hvcml6b250YWwnKSB7XG4gICAgICAgIGlmIChtb2RlbC5oYXMoWCkpIHtcbiAgICAgICAgICBwLnggPSB7XG4gICAgICAgICAgICBzY2FsZTogbW9kZWwuc2NhbGVOYW1lKFgpLFxuICAgICAgICAgICAgZmllbGQ6IG1vZGVsLmZpZWxkKFgpXG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwLnggPSB7XG4gICAgICAgICAgICBzY2FsZTogbW9kZWwuc2NhbGVOYW1lKFgpLFxuICAgICAgICAgICAgdmFsdWU6IDBcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1vZGVsLmhhcyhYMikpIHtcbiAgICAgICAgICBwLngyID0ge1xuICAgICAgICAgICAgc2NhbGU6IG1vZGVsLnNjYWxlTmFtZShYKSxcbiAgICAgICAgICAgIGZpZWxkOiBtb2RlbC5maWVsZChYMilcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHAueDIgPSB7XG4gICAgICAgICAgICBzY2FsZTogbW9kZWwuc2NhbGVOYW1lKFgpLFxuICAgICAgICAgICAgdmFsdWU6IDBcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgeyAvLyB2ZXJ0aWNhbFxuICAgICAgICBwLnhjID0ge1xuICAgICAgICAgIHNjYWxlOiBtb2RlbC5zY2FsZU5hbWUoWCksXG4gICAgICAgICAgZmllbGQ6IG1vZGVsLmZpZWxkKFgpXG4gICAgICAgIH07XG4gICAgICAgIHAud2lkdGggPSB7dmFsdWU6IHNpemVWYWx1ZShtb2RlbCwgWCl9O1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAobW9kZWwuZmllbGREZWYoWCkuYmluKSB7XG4gICAgICBpZiAobW9kZWwuaGFzKFNJWkUpICYmIG9yaWVudCAhPT0gJ2hvcml6b250YWwnKSB7XG4gICAgICAgIC8vIEZvciB2ZXJ0aWNhbCBjaGFydCB0aGF0IGhhcyBiaW5uZWQgWCBhbmQgc2l6ZSxcbiAgICAgICAgLy8gY2VudGVyIGJhciBhbmQgYXBwbHkgc2l6ZSB0byB3aWR0aC5cbiAgICAgICAgcC54YyA9IHtcbiAgICAgICAgICBzY2FsZTogbW9kZWwuc2NhbGVOYW1lKFgpLFxuICAgICAgICAgIGZpZWxkOiBtb2RlbC5maWVsZChYLCB7IGJpblN1ZmZpeDogJ19taWQnIH0pXG4gICAgICAgIH07XG4gICAgICAgIHAud2lkdGggPSB7XG4gICAgICAgICAgc2NhbGU6IG1vZGVsLnNjYWxlTmFtZShTSVpFKSxcbiAgICAgICAgICBmaWVsZDogbW9kZWwuZmllbGQoU0laRSlcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHAueCA9IHtcbiAgICAgICAgICBzY2FsZTogbW9kZWwuc2NhbGVOYW1lKFgpLFxuICAgICAgICAgIGZpZWxkOiBtb2RlbC5maWVsZChYLCB7IGJpblN1ZmZpeDogJ19zdGFydCcgfSksXG4gICAgICAgICAgb2Zmc2V0OiAxXG4gICAgICAgIH07XG4gICAgICAgIHAueDIgPSB7XG4gICAgICAgICAgc2NhbGU6IG1vZGVsLnNjYWxlTmFtZShYKSxcbiAgICAgICAgICBmaWVsZDogbW9kZWwuZmllbGQoWCwgeyBiaW5TdWZmaXg6ICdfZW5kJyB9KVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0gZWxzZSB7IC8vIHggaXMgZGltZW5zaW9uIG9yIHVuc3BlY2lmaWVkXG4gICAgICBpZiAobW9kZWwuaGFzKFgpKSB7IC8vIGlzIG9yZGluYWxcbiAgICAgICBwLnhjID0ge1xuICAgICAgICAgc2NhbGU6IG1vZGVsLnNjYWxlTmFtZShYKSxcbiAgICAgICAgIGZpZWxkOiBtb2RlbC5maWVsZChYKVxuICAgICAgIH07XG4gICAgIH0gZWxzZSB7IC8vIG5vIHhcbiAgICAgICAgcC54ID0geyB2YWx1ZTogMCwgb2Zmc2V0OiAyIH07XG4gICAgICB9XG5cbiAgICAgIHAud2lkdGggPSBtb2RlbC5oYXMoU0laRSkgJiYgb3JpZW50ICE9PSAnaG9yaXpvbnRhbCcgPyB7XG4gICAgICAgICAgLy8gYXBwbHkgc2l6ZSBzY2FsZSBpZiBoYXMgc2l6ZSBhbmQgaXMgdmVydGljYWwgKGV4cGxpY2l0IFwidmVydGljYWxcIiBvciB1bmRlZmluZWQpXG4gICAgICAgICAgc2NhbGU6IG1vZGVsLnNjYWxlTmFtZShTSVpFKSxcbiAgICAgICAgICBmaWVsZDogbW9kZWwuZmllbGQoU0laRSlcbiAgICAgICAgfSA6IHtcbiAgICAgICAgICAvLyBvdGhlcndpc2UsIHVzZSBmaXhlZCBzaXplXG4gICAgICAgICAgdmFsdWU6IHNpemVWYWx1ZShtb2RlbCwgKFgpKVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0IHlGaWVsZERlZiA9IG1vZGVsLmVuY29kaW5nKCkueTtcbiAgICBjb25zdCB5MkZpZWxkRGVmID0gbW9kZWwuZW5jb2RpbmcoKS55MjtcblxuICAgIGNvbnN0IHlJc01lYXN1cmUgPSBpc01lYXN1cmUoeUZpZWxkRGVmKSB8fCBpc01lYXN1cmUoeTJGaWVsZERlZik7XG4gICAgLy8geSwgeTIgJiBoZWlnaHQgLS0gd2UgbXVzdCBzcGVjaWZ5IHR3byBvZiB0aGVzZSBpbiBhbGwgY29uZGl0aW9uc1xuICAgIGlmIChzdGFjayAmJiBZID09PSBzdGFjay5maWVsZENoYW5uZWwpIHsgLy8geSBpcyBzdGFja2VkIG1lYXN1cmVcbiAgICAgIHAueSA9IHtcbiAgICAgICAgc2NhbGU6IG1vZGVsLnNjYWxlTmFtZShZKSxcbiAgICAgICAgZmllbGQ6IG1vZGVsLmZpZWxkKFksIHsgc3VmZml4OiAnX3N0YXJ0JyB9KVxuICAgICAgfTtcbiAgICAgIHAueTIgPSB7XG4gICAgICAgIHNjYWxlOiBtb2RlbC5zY2FsZU5hbWUoWSksXG4gICAgICAgIGZpZWxkOiBtb2RlbC5maWVsZChZLCB7IHN1ZmZpeDogJ19lbmQnIH0pXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAoeUlzTWVhc3VyZSkge1xuICAgICAgaWYgKG9yaWVudCAhPT0gJ2hvcml6b250YWwnKSB7IC8vIHZlcnRpY2FsIChleHBsaWNpdCAndmVydGljYWwnIG9yIHVuZGVmaW5lZClcbiAgICAgICAgaWYgKG1vZGVsLmhhcyhZKSkge1xuICAgICAgICAgIHAueSA9IHtcbiAgICAgICAgICAgIHNjYWxlOiBtb2RlbC5zY2FsZU5hbWUoWSksXG4gICAgICAgICAgICBmaWVsZDogbW9kZWwuZmllbGQoWSlcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHAueSA9IHtcbiAgICAgICAgICAgIHNjYWxlOiBtb2RlbC5zY2FsZU5hbWUoWSksXG4gICAgICAgICAgICB2YWx1ZTogMFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobW9kZWwuaGFzKFkyKSkge1xuICAgICAgICAgIHAueTIgPSB7XG4gICAgICAgICAgICBzY2FsZTogbW9kZWwuc2NhbGVOYW1lKFkpLFxuICAgICAgICAgICAgZmllbGQ6IG1vZGVsLmZpZWxkKFkyKVxuICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcC55MiA9IHtcbiAgICAgICAgICAgIHNjYWxlOiBtb2RlbC5zY2FsZU5hbWUoWSksXG4gICAgICAgICAgICB2YWx1ZTogMFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHAueWMgPSB7XG4gICAgICAgICAgc2NhbGU6IG1vZGVsLnNjYWxlTmFtZShZKSxcbiAgICAgICAgICBmaWVsZDogbW9kZWwuZmllbGQoWSlcbiAgICAgICAgfTtcbiAgICAgICAgcC5oZWlnaHQgPSB7IHZhbHVlOiBzaXplVmFsdWUobW9kZWwsIFkpIH07XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChtb2RlbC5maWVsZERlZihZKS5iaW4pIHtcbiAgICAgIGlmIChtb2RlbC5oYXMoU0laRSkgJiYgb3JpZW50ID09PSAnaG9yaXpvbnRhbCcpIHtcbiAgICAgICAgLy8gRm9yIGhvcml6b250YWwgY2hhcnQgdGhhdCBoYXMgYmlubmVkIFkgYW5kIHNpemUsXG4gICAgICAgIC8vIGNlbnRlciBiYXIgYW5kIGFwcGx5IHNpemUgdG8gaGVpZ2h0LlxuICAgICAgICBwLnljID0ge1xuICAgICAgICAgIHNjYWxlOiBtb2RlbC5zY2FsZU5hbWUoWSksXG4gICAgICAgICAgZmllbGQ6IG1vZGVsLmZpZWxkKFksIHsgYmluU3VmZml4OiAnX21pZCcgfSlcbiAgICAgICAgfTtcbiAgICAgICAgcC5oZWlnaHQgPSB7XG4gICAgICAgICAgc2NhbGU6IG1vZGVsLnNjYWxlTmFtZShTSVpFKSxcbiAgICAgICAgICBmaWVsZDogbW9kZWwuZmllbGQoU0laRSlcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIE90aGVyd2lzZSwgc2ltcGx5IHVzZSA8ZmllbGQ+X3N0YXJ0LCA8ZmllbGQ+X2VuZFxuICAgICAgICBwLnkgPSB7XG4gICAgICAgICAgc2NhbGU6IG1vZGVsLnNjYWxlTmFtZShZKSxcbiAgICAgICAgICBmaWVsZDogbW9kZWwuZmllbGQoWSwgeyBiaW5TdWZmaXg6ICdfc3RhcnQnIH0pXG4gICAgICAgIH07XG4gICAgICAgIHAueTIgPSB7XG4gICAgICAgICAgc2NhbGU6IG1vZGVsLnNjYWxlTmFtZShZKSxcbiAgICAgICAgICBmaWVsZDogbW9kZWwuZmllbGQoWSwgeyBiaW5TdWZmaXg6ICdfZW5kJyB9KSxcbiAgICAgICAgICBvZmZzZXQ6IDFcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9IGVsc2UgeyAvLyB5IGlzIG9yZGluYWwgb3IgdW5zcGVjaWZpZWRcblxuICAgICAgaWYgKG1vZGVsLmhhcyhZKSkgeyAvLyBpcyBvcmRpbmFsXG4gICAgICAgIHAueWMgPSB7XG4gICAgICAgICAgc2NhbGU6IG1vZGVsLnNjYWxlTmFtZShZKSxcbiAgICAgICAgICBmaWVsZDogbW9kZWwuZmllbGQoWSlcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7IC8vIE5vIFlcbiAgICAgICAgcC55MiA9IHtcbiAgICAgICAgICBmaWVsZDogeyBncm91cDogJ2hlaWdodCcgfSxcbiAgICAgICAgICBvZmZzZXQ6IC0xXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHAuaGVpZ2h0ID0gbW9kZWwuaGFzKFNJWkUpICAmJiBvcmllbnQgPT09ICdob3Jpem9udGFsJyA/IHtcbiAgICAgICAgICAvLyBhcHBseSBzaXplIHNjYWxlIGlmIGhhcyBzaXplIGFuZCBpcyBob3Jpem9udGFsXG4gICAgICAgICAgc2NhbGU6IG1vZGVsLnNjYWxlTmFtZShTSVpFKSxcbiAgICAgICAgICBmaWVsZDogbW9kZWwuZmllbGQoU0laRSlcbiAgICAgICAgfSA6IHtcbiAgICAgICAgICB2YWx1ZTogc2l6ZVZhbHVlKG1vZGVsLCBZKVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGFwcGx5Q29sb3JBbmRPcGFjaXR5KHAsIG1vZGVsKTtcbiAgICByZXR1cm4gcDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNpemVWYWx1ZShtb2RlbDogVW5pdE1vZGVsLCBjaGFubmVsOiBDaGFubmVsKSB7XG4gICAgY29uc3QgZmllbGREZWYgPSBtb2RlbC5maWVsZERlZihTSVpFKTtcbiAgICBpZiAoZmllbGREZWYgJiYgZmllbGREZWYudmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgIHJldHVybiBmaWVsZERlZi52YWx1ZTtcbiAgICB9XG5cbiAgICBjb25zdCBtYXJrQ29uZmlnID0gbW9kZWwuY29uZmlnKCkubWFyaztcbiAgICBpZiAobWFya0NvbmZpZy5iYXJTaXplKSB7XG4gICAgICByZXR1cm4gbWFya0NvbmZpZy5iYXJTaXplO1xuICAgIH1cbiAgICAvLyBCQVIncyBzaXplIGlzIGFwcGxpZWQgb24gZWl0aGVyIFggb3IgWVxuICAgIHJldHVybiBtb2RlbC5pc09yZGluYWxTY2FsZShjaGFubmVsKSA/XG4gICAgICAgIC8vIEZvciBvcmRpbmFsIHNjYWxlIG9yIHNpbmdsZSBiYXIsIHdlIGNhbiB1c2UgYmFuZFNpemUgLSAxXG4gICAgICAgIC8vICgtMSBzbyB0aGF0IHRoZSBib3JkZXIgb2YgdGhlIGJhciBmYWxscyBvbiBleGFjdCBwaXhlbClcbiAgICAgICAgbW9kZWwuc2NhbGUoY2hhbm5lbCkuYmFuZFNpemUgLSAxIDpcbiAgICAgICFtb2RlbC5oYXMoY2hhbm5lbCkgP1xuICAgICAgICBtb2RlbC5jb25maWcoKS5zY2FsZS5iYW5kU2l6ZSAtIDEgOlxuICAgICAgICAvLyBvdGhlcndpc2UsIHNldCB0byB0aGluQmFyV2lkdGggYnkgZGVmYXVsdFxuICAgICAgICBtYXJrQ29uZmlnLmJhclRoaW5TaXplO1xuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIGxhYmVscyhtb2RlbDogVW5pdE1vZGVsKSB7XG4gICAgLy8gVE9ETygjNjQpOiBmaWxsIHRoaXMgbWV0aG9kXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxufVxuIiwiaW1wb3J0IHtVbml0TW9kZWx9IGZyb20gJy4uL3VuaXQnO1xuaW1wb3J0IHtYLCBZLCBTSVpFfSBmcm9tICcuLi8uLi9jaGFubmVsJztcbmltcG9ydCB7YXBwbHlDb2xvckFuZE9wYWNpdHksIGFwcGx5TWFya0NvbmZpZ30gZnJvbSAnLi4vY29tbW9uJztcblxuXG5leHBvcnQgbmFtZXNwYWNlIGxpbmUge1xuICBleHBvcnQgZnVuY3Rpb24gbWFya1R5cGUoKSB7XG4gICAgcmV0dXJuICdsaW5lJztcbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiBwcm9wZXJ0aWVzKG1vZGVsOiBVbml0TW9kZWwpIHtcbiAgICAvLyBUT0RPIFVzZSBWZWdhJ3MgbWFya3MgcHJvcGVydGllcyBpbnRlcmZhY2VcbiAgICBsZXQgcDogYW55ID0ge307XG5cbiAgICAvLyB4XG4gICAgaWYgKG1vZGVsLmhhcyhYKSkge1xuICAgICAgcC54ID0ge1xuICAgICAgICBzY2FsZTogbW9kZWwuc2NhbGVOYW1lKFgpLFxuICAgICAgICBmaWVsZDogbW9kZWwuZmllbGQoWCwgeyBiaW5TdWZmaXg6ICdfbWlkJyB9KVxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcC54ID0geyB2YWx1ZTogMCB9O1xuICAgIH1cblxuICAgIC8vIHlcbiAgICBpZiAobW9kZWwuaGFzKFkpKSB7XG4gICAgICBwLnkgPSB7XG4gICAgICAgIHNjYWxlOiBtb2RlbC5zY2FsZU5hbWUoWSksXG4gICAgICAgIGZpZWxkOiBtb2RlbC5maWVsZChZLCB7IGJpblN1ZmZpeDogJ19taWQnIH0pXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBwLnkgPSB7IGZpZWxkOiB7IGdyb3VwOiAnaGVpZ2h0JyB9IH07XG4gICAgfVxuXG4gICAgYXBwbHlDb2xvckFuZE9wYWNpdHkocCwgbW9kZWwpO1xuICAgIGFwcGx5TWFya0NvbmZpZyhwLCBtb2RlbCwgWydpbnRlcnBvbGF0ZScsICd0ZW5zaW9uJ10pO1xuXG4gICAgLy8gc2l6ZSBhcyBhIGNoYW5uZWwgaXMgbm90IHN1cHBvcnRlZCBpbiBWZWdhIHlldC5cbiAgICBjb25zdCBzaXplID0gc2l6ZVZhbHVlKG1vZGVsKTtcbiAgICBpZiAoc2l6ZSkge1xuICAgICAgcC5zdHJva2VXaWR0aCA9IHsgdmFsdWU6IHNpemUgfTtcbiAgICB9XG4gICAgcmV0dXJuIHA7XG4gIH1cblxuICBmdW5jdGlvbiBzaXplVmFsdWUobW9kZWw6IFVuaXRNb2RlbCkge1xuICAgIGNvbnN0IGZpZWxkRGVmID0gbW9kZWwuZmllbGREZWYoU0laRSk7XG4gICAgaWYgKGZpZWxkRGVmICYmIGZpZWxkRGVmLnZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICByZXR1cm4gZmllbGREZWYudmFsdWU7XG4gICAgfVxuICAgIHJldHVybiBtb2RlbC5jb25maWcoKS5tYXJrLmxpbmVTaXplO1xuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIGxhYmVscyhtb2RlbDogVW5pdE1vZGVsKSB7XG4gICAgLy8gVE9ETygjMjQwKTogZmlsbCB0aGlzIG1ldGhvZFxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cbiIsImltcG9ydCB7VW5pdE1vZGVsfSBmcm9tICcuLi91bml0JztcbmltcG9ydCB7T3JkZXJDaGFubmVsRGVmfSBmcm9tICcuLi8uLi9maWVsZGRlZic7XG5cbmltcG9ydCB7WCwgWSwgQ09MT1IsIFRFWFQsIFNIQVBFLCBQQVRILCBPUkRFUiwgT1BBQ0lUWSwgREVUQUlMLCBMQUJFTH0gZnJvbSAnLi4vLi4vY2hhbm5lbCc7XG5pbXBvcnQge0FSRUEsIExJTkUsIFRFWFQgYXMgVEVYVE1BUkt9IGZyb20gJy4uLy4uL21hcmsnO1xuaW1wb3J0IHtpbXB1dGVUcmFuc2Zvcm0sIHN0YWNrVHJhbnNmb3JtfSBmcm9tICcuLi9zdGFjayc7XG5pbXBvcnQge2NvbnRhaW5zLCBleHRlbmR9IGZyb20gJy4uLy4uL3V0aWwnO1xuaW1wb3J0IHthcmVhfSBmcm9tICcuL2FyZWEnO1xuaW1wb3J0IHtiYXJ9IGZyb20gJy4vYmFyJztcbmltcG9ydCB7bGluZX0gZnJvbSAnLi9saW5lJztcbmltcG9ydCB7cG9pbnQsIGNpcmNsZSwgc3F1YXJlfSBmcm9tICcuL3BvaW50JztcbmltcG9ydCB7dGV4dH0gZnJvbSAnLi90ZXh0JztcbmltcG9ydCB7dGlja30gZnJvbSAnLi90aWNrJztcbmltcG9ydCB7cnVsZX0gZnJvbSAnLi9ydWxlJztcbmltcG9ydCB7c29ydEZpZWxkfSBmcm9tICcuLi9jb21tb24nO1xuXG5jb25zdCBtYXJrQ29tcGlsZXIgPSB7XG4gIGFyZWE6IGFyZWEsXG4gIGJhcjogYmFyLFxuICBsaW5lOiBsaW5lLFxuICBwb2ludDogcG9pbnQsXG4gIHRleHQ6IHRleHQsXG4gIHRpY2s6IHRpY2ssXG4gIHJ1bGU6IHJ1bGUsXG4gIGNpcmNsZTogY2lyY2xlLFxuICBzcXVhcmU6IHNxdWFyZVxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTWFyayhtb2RlbDogVW5pdE1vZGVsKTogYW55W10ge1xuICBpZiAoY29udGFpbnMoW0xJTkUsIEFSRUFdLCBtb2RlbC5tYXJrKCkpKSB7XG4gICAgcmV0dXJuIHBhcnNlUGF0aE1hcmsobW9kZWwpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBwYXJzZU5vblBhdGhNYXJrKG1vZGVsKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBwYXJzZVBhdGhNYXJrKG1vZGVsOiBVbml0TW9kZWwpIHsgLy8gVE9ETzogZXh0cmFjdCB0aGlzIGludG8gY29tcGlsZVBhdGhNYXJrXG4gIGNvbnN0IG1hcmsgPSBtb2RlbC5tYXJrKCk7XG4gIC8vIFRPRE86IHJlcGxhY2UgdGhpcyB3aXRoIG1vcmUgZ2VuZXJhbCBjYXNlIGZvciBjb21wb3NpdGlvblxuICBjb25zdCBpc0ZhY2V0ZWQgPSBtb2RlbC5wYXJlbnQoKSAmJiBtb2RlbC5wYXJlbnQoKS5pc0ZhY2V0KCk7XG4gIGNvbnN0IGRhdGFGcm9tID0ge2RhdGE6IG1vZGVsLmRhdGFUYWJsZSgpfTtcbiAgY29uc3QgZGV0YWlscyA9IGRldGFpbEZpZWxkcyhtb2RlbCk7XG5cbiAgbGV0IHBhdGhNYXJrczogYW55ID0gW1xuICAgIHtcbiAgICAgIG5hbWU6IG1vZGVsLm5hbWUoJ21hcmtzJyksXG4gICAgICB0eXBlOiBtYXJrQ29tcGlsZXJbbWFya10ubWFya1R5cGUoKSxcbiAgICAgIGZyb206IGV4dGVuZChcbiAgICAgICAgLy8gSWYgaGFzIGZhY2V0LCBgZnJvbS5kYXRhYCB3aWxsIGJlIGFkZGVkIGluIHRoZSBjZWxsIGdyb3VwLlxuICAgICAgICAvLyBJZiBoYXMgc3ViZmFjZXQgZm9yIGxpbmUvYXJlYSBncm91cCwgYGZyb20uZGF0YWAgd2lsbCBiZSBhZGRlZCBpbiB0aGUgb3V0ZXIgc3ViZmFjZXQgZ3JvdXAgYmVsb3cuXG4gICAgICAgIC8vIElmIGhhcyBubyBzdWJmYWNldCwgYWRkIGZyb20uZGF0YS5cbiAgICAgICAgaXNGYWNldGVkIHx8IGRldGFpbHMubGVuZ3RoID4gMCA/IHt9IDogZGF0YUZyb20sXG5cbiAgICAgICAgLy8gc29ydCB0cmFuc2Zvcm1cbiAgICAgICAge3RyYW5zZm9ybTogW3sgdHlwZTogJ3NvcnQnLCBieTogc29ydFBhdGhCeShtb2RlbCl9XX1cbiAgICAgICksXG4gICAgICBwcm9wZXJ0aWVzOiB7IHVwZGF0ZTogbWFya0NvbXBpbGVyW21hcmtdLnByb3BlcnRpZXMobW9kZWwpIH1cbiAgICB9XG4gIF07XG5cbiAgaWYgKGRldGFpbHMubGVuZ3RoID4gMCkgeyAvLyBoYXZlIGxldmVsIG9mIGRldGFpbHMgLSBuZWVkIHRvIGZhY2V0IGxpbmUgaW50byBzdWJncm91cHNcbiAgICBjb25zdCBmYWNldFRyYW5zZm9ybSA9IHsgdHlwZTogJ2ZhY2V0JywgZ3JvdXBieTogZGV0YWlscyB9O1xuICAgIGNvbnN0IHRyYW5zZm9ybTogYW55W10gPSBtYXJrID09PSBBUkVBICYmIG1vZGVsLnN0YWNrKCkgP1xuICAgICAgLy8gRm9yIHN0YWNrZWQgYXJlYSwgd2UgbmVlZCB0byBpbXB1dGUgbWlzc2luZyB0dXBsZXMgYW5kIHN0YWNrIHZhbHVlc1xuICAgICAgLy8gKE1hcmsgbGF5ZXIgb3JkZXIgZG9lcyBub3QgbWF0dGVyIGZvciBzdGFja2VkIGNoYXJ0cylcbiAgICAgIFtpbXB1dGVUcmFuc2Zvcm0obW9kZWwpLCBzdGFja1RyYW5zZm9ybShtb2RlbCksIGZhY2V0VHJhbnNmb3JtXSA6XG4gICAgICAvLyBGb3Igbm9uLXN0YWNrZWQgcGF0aCAobGluZS9hcmVhKSwgd2UgbmVlZCB0byBmYWNldCBhbmQgcG9zc2libHkgc29ydFxuICAgICAgW10uY29uY2F0KFxuICAgICAgICBmYWNldFRyYW5zZm9ybSxcbiAgICAgICAgLy8gaWYgbW9kZWwgaGFzIGBvcmRlcmAsIHRoZW4gc29ydCBtYXJrJ3MgbGF5ZXIgb3JkZXIgYnkgYG9yZGVyYCBmaWVsZChzKVxuICAgICAgICBtb2RlbC5oYXMoT1JERVIpID8gW3t0eXBlOidzb3J0JywgYnk6IHNvcnRCeShtb2RlbCl9XSA6IFtdXG4gICAgICApO1xuXG4gICAgcmV0dXJuIFt7XG4gICAgICBuYW1lOiBtb2RlbC5uYW1lKCdwYXRoZ3JvdXAnKSxcbiAgICAgIHR5cGU6ICdncm91cCcsXG4gICAgICBmcm9tOiBleHRlbmQoXG4gICAgICAgIC8vIElmIGhhcyBmYWNldCwgYGZyb20uZGF0YWAgd2lsbCBiZSBhZGRlZCBpbiB0aGUgY2VsbCBncm91cC5cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCBhZGQgaXQgaGVyZS5cbiAgICAgICAgaXNGYWNldGVkID8ge30gOiBkYXRhRnJvbSxcbiAgICAgICAge3RyYW5zZm9ybTogdHJhbnNmb3JtfVxuICAgICAgKSxcbiAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgdXBkYXRlOiB7XG4gICAgICAgICAgd2lkdGg6IHsgZmllbGQ6IHsgZ3JvdXA6ICd3aWR0aCcgfSB9LFxuICAgICAgICAgIGhlaWdodDogeyBmaWVsZDogeyBncm91cDogJ2hlaWdodCcgfSB9XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBtYXJrczogcGF0aE1hcmtzXG4gICAgfV07XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHBhdGhNYXJrcztcbiAgfVxufVxuXG5mdW5jdGlvbiBwYXJzZU5vblBhdGhNYXJrKG1vZGVsOiBVbml0TW9kZWwpIHtcbiAgY29uc3QgbWFyayA9IG1vZGVsLm1hcmsoKTtcbiAgY29uc3QgaXNGYWNldGVkID0gbW9kZWwucGFyZW50KCkgJiYgbW9kZWwucGFyZW50KCkuaXNGYWNldCgpO1xuICBjb25zdCBkYXRhRnJvbSA9IHtkYXRhOiBtb2RlbC5kYXRhVGFibGUoKX07XG5cbiAgbGV0IG1hcmtzID0gW107IC8vIFRPRE86IHZnTWFya3NcbiAgaWYgKG1hcmsgPT09IFRFWFRNQVJLICYmXG4gICAgbW9kZWwuaGFzKENPTE9SKSAmJlxuICAgIG1vZGVsLmNvbmZpZygpLm1hcmsuYXBwbHlDb2xvclRvQmFja2dyb3VuZCAmJiAhbW9kZWwuaGFzKFgpICYmICFtb2RlbC5oYXMoWSlcbiAgKSB7XG4gICAgLy8gYWRkIGJhY2tncm91bmQgdG8gJ3RleHQnIG1hcmtzIGlmIGhhcyBjb2xvclxuICAgIG1hcmtzLnB1c2goZXh0ZW5kKFxuICAgICAge1xuICAgICAgICBuYW1lOiBtb2RlbC5uYW1lKCdiYWNrZ3JvdW5kJyksXG4gICAgICAgIHR5cGU6ICdyZWN0J1xuICAgICAgfSxcbiAgICAgIC8vIElmIGhhcyBmYWNldCwgYGZyb20uZGF0YWAgd2lsbCBiZSBhZGRlZCBpbiB0aGUgY2VsbCBncm91cC5cbiAgICAgIC8vIE90aGVyd2lzZSwgYWRkIGl0IGhlcmUuXG4gICAgICBpc0ZhY2V0ZWQgPyB7fSA6IHtmcm9tOiBkYXRhRnJvbX0sXG4gICAgICAvLyBQcm9wZXJ0aWVzXG4gICAgICB7IHByb3BlcnRpZXM6IHsgdXBkYXRlOiB0ZXh0LmJhY2tncm91bmQobW9kZWwpIH0gfVxuICAgICkpO1xuICB9XG5cbiAgbWFya3MucHVzaChleHRlbmQoXG4gICAge1xuICAgICAgbmFtZTogbW9kZWwubmFtZSgnbWFya3MnKSxcbiAgICAgIHR5cGU6IG1hcmtDb21waWxlclttYXJrXS5tYXJrVHlwZSgpXG4gICAgfSxcbiAgICAvLyBBZGQgYGZyb21gIGlmIG5lZWRlZFxuICAgICghaXNGYWNldGVkIHx8IG1vZGVsLnN0YWNrKCkgfHwgbW9kZWwuaGFzKE9SREVSKSkgPyB7XG4gICAgICBmcm9tOiBleHRlbmQoXG4gICAgICAgIC8vIElmIGZhY2V0ZWQsIGBmcm9tLmRhdGFgIHdpbGwgYmUgYWRkZWQgaW4gdGhlIGNlbGwgZ3JvdXAuXG4gICAgICAgIC8vIE90aGVyd2lzZSwgYWRkIGl0IGhlcmVcbiAgICAgICAgaXNGYWNldGVkID8ge30gOiBkYXRhRnJvbSxcbiAgICAgICAgLy8gYGZyb20udHJhbnNmb3JtYFxuICAgICAgICBtb2RlbC5zdGFjaygpID8gLy8gU3RhY2tlZCBDaGFydCBuZWVkIHN0YWNrIHRyYW5zZm9ybVxuICAgICAgICAgIHsgdHJhbnNmb3JtOiBbc3RhY2tUcmFuc2Zvcm0obW9kZWwpXSB9IDpcbiAgICAgICAgbW9kZWwuaGFzKE9SREVSKSA/XG4gICAgICAgICAgLy8gaWYgbm9uLXN0YWNrZWQsIGRldGFpbCBmaWVsZCBkZXRlcm1pbmVzIHRoZSBsYXllciBvcmRlciBvZiBlYWNoIG1hcmtcbiAgICAgICAgICB7IHRyYW5zZm9ybTogW3t0eXBlOidzb3J0JywgYnk6IHNvcnRCeShtb2RlbCl9XSB9IDpcbiAgICAgICAgICB7fVxuICAgICAgKVxuICAgIH0gOiB7fSxcbiAgICAvLyBwcm9wZXJ0aWVzIGdyb3Vwc1xuICAgIHsgcHJvcGVydGllczogeyB1cGRhdGU6IG1hcmtDb21waWxlclttYXJrXS5wcm9wZXJ0aWVzKG1vZGVsKSB9IH1cbiAgKSk7XG5cbiAgaWYgKG1vZGVsLmhhcyhMQUJFTCkgJiYgbWFya0NvbXBpbGVyW21hcmtdLmxhYmVscykge1xuICAgIGNvbnN0IGxhYmVsUHJvcGVydGllcyA9IG1hcmtDb21waWxlclttYXJrXS5sYWJlbHMobW9kZWwpO1xuXG4gICAgLy8gY2hlY2sgaWYgd2UgaGF2ZSBsYWJlbCBtZXRob2QgZm9yIGN1cnJlbnQgbWFyayB0eXBlLlxuICAgIGlmIChsYWJlbFByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkgeyAvLyBJZiBsYWJlbCBpcyBzdXBwb3J0ZWRcbiAgICAgIC8vIGFkZCBsYWJlbCBncm91cFxuICAgICAgbWFya3MucHVzaChleHRlbmQoXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiBtb2RlbC5uYW1lKCdsYWJlbCcpLFxuICAgICAgICAgIHR5cGU6ICd0ZXh0J1xuICAgICAgICB9LFxuICAgICAgICAvLyBJZiBoYXMgZmFjZXQsIGBmcm9tLmRhdGFgIHdpbGwgYmUgYWRkZWQgaW4gdGhlIGNlbGwgZ3JvdXAuXG4gICAgICAgIC8vIE90aGVyd2lzZSwgYWRkIGl0IGhlcmUuXG4gICAgICAgIGlzRmFjZXRlZCA/IHt9IDoge2Zyb206IGRhdGFGcm9tfSxcbiAgICAgICAgLy8gUHJvcGVydGllc1xuICAgICAgICB7IHByb3BlcnRpZXM6IHsgdXBkYXRlOiBsYWJlbFByb3BlcnRpZXMgfSB9XG4gICAgICApKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbWFya3M7XG59XG5cbmZ1bmN0aW9uIHNvcnRCeShtb2RlbDogVW5pdE1vZGVsKTogc3RyaW5nIHwgc3RyaW5nW10ge1xuICBpZiAobW9kZWwuaGFzKE9SREVSKSkge1xuICAgIGxldCBjaGFubmVsRGVmID0gbW9kZWwuZW5jb2RpbmcoKS5vcmRlcjtcbiAgICBpZiAoY2hhbm5lbERlZiBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAvLyBzb3J0IGJ5IG11bHRpcGxlIGZpZWxkc1xuICAgICAgcmV0dXJuIGNoYW5uZWxEZWYubWFwKHNvcnRGaWVsZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHNvcnQgYnkgb25lIGZpZWxkXG4gICAgICByZXR1cm4gc29ydEZpZWxkKGNoYW5uZWxEZWYgYXMgT3JkZXJDaGFubmVsRGVmKTsgLy8gaGF2ZSB0byBhZGQgT3JkZXJDaGFubmVsRGVmIHRvIG1ha2UgdHNpZnkgbm90IGNvbXBsYWluaW5nXG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsOyAvLyB1c2UgZGVmYXVsdCBvcmRlclxufVxuXG4vKipcbiAqIFJldHVybiBwYXRoIG9yZGVyIGZvciBzb3J0IHRyYW5zZm9ybSdzIGJ5IHByb3BlcnR5XG4gKi9cbmZ1bmN0aW9uIHNvcnRQYXRoQnkobW9kZWw6IFVuaXRNb2RlbCk6IHN0cmluZyB8IHN0cmluZ1tdIHtcbiAgaWYgKG1vZGVsLm1hcmsoKSA9PT0gTElORSAmJiBtb2RlbC5oYXMoUEFUSCkpIHtcbiAgICAvLyBGb3Igb25seSBsaW5lLCBzb3J0IGJ5IHRoZSBwYXRoIGZpZWxkIGlmIGl0IGlzIHNwZWNpZmllZC5cbiAgICBjb25zdCBjaGFubmVsRGVmID0gbW9kZWwuZW5jb2RpbmcoKS5wYXRoO1xuICAgIGlmIChjaGFubmVsRGVmIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgIC8vIHNvcnQgYnkgbXVsdGlwbGUgZmllbGRzXG4gICAgICByZXR1cm4gY2hhbm5lbERlZi5tYXAoc29ydEZpZWxkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gc29ydCBieSBvbmUgZmllbGRcbiAgICAgIHJldHVybiBzb3J0RmllbGQoY2hhbm5lbERlZiBhcyBPcmRlckNoYW5uZWxEZWYpOyAvLyBoYXZlIHRvIGFkZCBPcmRlckNoYW5uZWxEZWYgdG8gbWFrZSB0c2lmeSBub3QgY29tcGxhaW5pbmdcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gRm9yIGJvdGggbGluZSBhbmQgYXJlYSwgd2Ugc29ydCB2YWx1ZXMgYmFzZWQgb24gZGltZW5zaW9uIGJ5IGRlZmF1bHRcbiAgICByZXR1cm4gJy0nICsgbW9kZWwuZmllbGQobW9kZWwuY29uZmlnKCkubWFyay5vcmllbnQgPT09ICdob3Jpem9udGFsJyA/IFkgOiBYKTtcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgbGlzdCBvZiBkZXRhaWwgZmllbGRzIChmb3IgJ2NvbG9yJywgJ3NoYXBlJywgb3IgJ2RldGFpbCcgY2hhbm5lbHMpXG4gKiB0aGF0IHRoZSBtb2RlbCdzIHNwZWMgY29udGFpbnMuXG4gKi9cbmZ1bmN0aW9uIGRldGFpbEZpZWxkcyhtb2RlbDogVW5pdE1vZGVsKTogc3RyaW5nW10ge1xuICByZXR1cm4gW0NPTE9SLCBERVRBSUwsIE9QQUNJVFksIFNIQVBFXS5yZWR1Y2UoZnVuY3Rpb24oZGV0YWlscywgY2hhbm5lbCkge1xuICAgIGlmIChtb2RlbC5oYXMoY2hhbm5lbCkgJiYgIW1vZGVsLmZpZWxkRGVmKGNoYW5uZWwpLmFnZ3JlZ2F0ZSkge1xuICAgICAgZGV0YWlscy5wdXNoKG1vZGVsLmZpZWxkKGNoYW5uZWwpKTtcbiAgICB9XG4gICAgcmV0dXJuIGRldGFpbHM7XG4gIH0sIFtdKTtcbn1cbiIsImltcG9ydCB7VW5pdE1vZGVsfSBmcm9tICcuLi91bml0JztcbmltcG9ydCB7WCwgWSwgU0hBUEUsIFNJWkV9IGZyb20gJy4uLy4uL2NoYW5uZWwnO1xuaW1wb3J0IHthcHBseUNvbG9yQW5kT3BhY2l0eX0gZnJvbSAnLi4vY29tbW9uJztcblxuZXhwb3J0IG5hbWVzcGFjZSBwb2ludCB7XG4gIGV4cG9ydCBmdW5jdGlvbiBtYXJrVHlwZSgpIHtcbiAgICByZXR1cm4gJ3N5bWJvbCc7XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gcHJvcGVydGllcyhtb2RlbDogVW5pdE1vZGVsLCBmaXhlZFNoYXBlPzogc3RyaW5nKSB7XG4gICAgLy8gVE9ETyBVc2UgVmVnYSdzIG1hcmtzIHByb3BlcnRpZXMgaW50ZXJmYWNlXG4gICAgbGV0IHA6IGFueSA9IHt9O1xuXG4gICAgLy8geFxuICAgIGlmIChtb2RlbC5oYXMoWCkpIHtcbiAgICAgIHAueCA9IHtcbiAgICAgICAgc2NhbGU6IG1vZGVsLnNjYWxlTmFtZShYKSxcbiAgICAgICAgZmllbGQ6IG1vZGVsLmZpZWxkKFgsIHsgYmluU3VmZml4OiAnX21pZCcgfSlcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHAueCA9IHsgdmFsdWU6IG1vZGVsLmNvbmZpZygpLnNjYWxlLmJhbmRTaXplIC8gMiB9O1xuICAgIH1cblxuICAgIC8vIHlcbiAgICBpZiAobW9kZWwuaGFzKFkpKSB7XG4gICAgICBwLnkgPSB7XG4gICAgICAgIHNjYWxlOiBtb2RlbC5zY2FsZU5hbWUoWSksXG4gICAgICAgIGZpZWxkOiBtb2RlbC5maWVsZChZLCB7IGJpblN1ZmZpeDogJ19taWQnIH0pXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBwLnkgPSB7IHZhbHVlOiBtb2RlbC5jb25maWcoKS5zY2FsZS5iYW5kU2l6ZSAvIDIgfTtcbiAgICB9XG5cbiAgICAvLyBzaXplXG4gICAgaWYgKG1vZGVsLmhhcyhTSVpFKSkge1xuICAgICAgcC5zaXplID0ge1xuICAgICAgICBzY2FsZTogbW9kZWwuc2NhbGVOYW1lKFNJWkUpLFxuICAgICAgICBmaWVsZDogbW9kZWwuZmllbGQoU0laRSlcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHAuc2l6ZSA9IHsgdmFsdWU6IHNpemVWYWx1ZShtb2RlbCkgfTtcbiAgICB9XG5cbiAgICAvLyBzaGFwZVxuICAgIGlmIChmaXhlZFNoYXBlKSB7IC8vIHNxdWFyZSBhbmQgY2lyY2xlIG1hcmtzXG4gICAgICBwLnNoYXBlID0geyB2YWx1ZTogZml4ZWRTaGFwZSB9O1xuICAgIH0gZWxzZSBpZiAobW9kZWwuaGFzKFNIQVBFKSkge1xuICAgICAgcC5zaGFwZSA9IHtcbiAgICAgICAgc2NhbGU6IG1vZGVsLnNjYWxlTmFtZShTSEFQRSksXG4gICAgICAgIGZpZWxkOiBtb2RlbC5maWVsZChTSEFQRSlcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChtb2RlbC5maWVsZERlZihTSEFQRSkudmFsdWUpIHtcbiAgICAgIHAuc2hhcGUgPSB7IHZhbHVlOiBtb2RlbC5maWVsZERlZihTSEFQRSkudmFsdWUgfTtcbiAgICB9IGVsc2UgaWYgKG1vZGVsLmNvbmZpZygpLm1hcmsuc2hhcGUpIHtcbiAgICAgIHAuc2hhcGUgPSB7IHZhbHVlOiBtb2RlbC5jb25maWcoKS5tYXJrLnNoYXBlIH07XG4gICAgfVxuXG4gICAgYXBwbHlDb2xvckFuZE9wYWNpdHkocCwgbW9kZWwpO1xuICAgIHJldHVybiBwO1xuICB9XG5cbiAgZnVuY3Rpb24gc2l6ZVZhbHVlKG1vZGVsOiBVbml0TW9kZWwpIHtcbiAgICBjb25zdCBmaWVsZERlZiA9IG1vZGVsLmZpZWxkRGVmKFNJWkUpO1xuICAgIGlmIChmaWVsZERlZiAmJiBmaWVsZERlZi52YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgcmV0dXJuIGZpZWxkRGVmLnZhbHVlO1xuICAgIH1cblxuICAgIHJldHVybiBtb2RlbC5jb25maWcoKS5tYXJrLnNpemU7XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gbGFiZWxzKG1vZGVsOiBVbml0TW9kZWwpIHtcbiAgICAvLyBUT0RPKCMyNDApOiBmaWxsIHRoaXMgbWV0aG9kXG4gIH1cbn1cblxuZXhwb3J0IG5hbWVzcGFjZSBjaXJjbGUge1xuICBleHBvcnQgZnVuY3Rpb24gbWFya1R5cGUoKSB7XG4gICAgcmV0dXJuICdzeW1ib2wnO1xuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIHByb3BlcnRpZXMobW9kZWw6IFVuaXRNb2RlbCkge1xuICAgIHJldHVybiBwb2ludC5wcm9wZXJ0aWVzKG1vZGVsLCAnY2lyY2xlJyk7XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gbGFiZWxzKG1vZGVsOiBVbml0TW9kZWwpIHtcbiAgICAvLyBUT0RPKCMyNDApOiBmaWxsIHRoaXMgbWV0aG9kXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxufVxuXG5leHBvcnQgbmFtZXNwYWNlIHNxdWFyZSB7XG4gIGV4cG9ydCBmdW5jdGlvbiBtYXJrVHlwZSgpIHtcbiAgICByZXR1cm4gJ3N5bWJvbCc7XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gcHJvcGVydGllcyhtb2RlbDogVW5pdE1vZGVsKSB7XG4gICAgcmV0dXJuIHBvaW50LnByb3BlcnRpZXMobW9kZWwsICdzcXVhcmUnKTtcbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiBsYWJlbHMobW9kZWw6IFVuaXRNb2RlbCkge1xuICAgIC8vIFRPRE8oIzI0MCk6IGZpbGwgdGhpcyBtZXRob2RcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG4iLCJpbXBvcnQge1gsIFksIFgyLCBZMiwgU0laRX0gZnJvbSAnLi4vLi4vY2hhbm5lbCc7XG5cbmltcG9ydCB7VW5pdE1vZGVsfSBmcm9tICcuLi91bml0JztcbmltcG9ydCB7YXBwbHlDb2xvckFuZE9wYWNpdHl9IGZyb20gJy4uL2NvbW1vbic7XG5cbmV4cG9ydCBuYW1lc3BhY2UgcnVsZSB7XG4gIGV4cG9ydCBmdW5jdGlvbiBtYXJrVHlwZSgpIHtcbiAgICByZXR1cm4gJ3J1bGUnO1xuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIHByb3BlcnRpZXMobW9kZWw6IFVuaXRNb2RlbCkge1xuICAgIGxldCBwOiBhbnkgPSB7fTtcblxuICAgIC8vIFRPRE86IHN1cHBvcnQgZXhwbGljaXQgdmFsdWVcbiAgICBpZihtb2RlbC5jb25maWcoKS5tYXJrLm9yaWVudCA9PT0gJ3ZlcnRpY2FsJykge1xuICAgICAgaWYgKG1vZGVsLmhhcyhYKSkge1xuICAgICAgICBwLnggPSB7XG4gICAgICAgICAgc2NhbGU6IG1vZGVsLnNjYWxlTmFtZShYKSxcbiAgICAgICAgICBmaWVsZDogbW9kZWwuZmllbGQoWCwgeyBiaW5TdWZmaXg6ICdfbWlkJyB9KVxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcC54ID0geyB2YWx1ZSA6IDB9O1xuICAgICAgfVxuXG4gICAgICBpZiAobW9kZWwuaGFzKFkpKSB7XG4gICAgICAgIHAueSA9IHtcbiAgICAgICAgICBzY2FsZTogbW9kZWwuc2NhbGVOYW1lKFkpLFxuICAgICAgICAgIGZpZWxkOiBtb2RlbC5maWVsZChZLCB7IGJpblN1ZmZpeDogJ19taWQnIH0pXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwLnkgPSB7IGZpZWxkOiB7IGdyb3VwOiAnaGVpZ2h0JyB9IH07XG4gICAgICB9XG5cbiAgICAgIGlmIChtb2RlbC5oYXMoWTIpKSB7XG4gICAgICAgIHAueTIgPSB7XG4gICAgICAgICAgc2NhbGU6IG1vZGVsLnNjYWxlTmFtZShZKSxcbiAgICAgICAgICBmaWVsZDogbW9kZWwuZmllbGQoWTIsIHsgYmluU3VmZml4OiAnX21pZCcgfSlcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHAueTIgPSB7IHZhbHVlOiAwIH07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChtb2RlbC5oYXMoWSkpIHtcbiAgICAgICAgcC55ID0ge1xuICAgICAgICAgIHNjYWxlOiBtb2RlbC5zY2FsZU5hbWUoWSksXG4gICAgICAgICAgZmllbGQ6IG1vZGVsLmZpZWxkKFksIHsgYmluU3VmZml4OiAnX21pZCcgfSlcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHAueSA9IHsgdmFsdWU6IDAgfTtcbiAgICAgIH1cblxuICAgICAgaWYgKG1vZGVsLmhhcyhYKSkge1xuICAgICAgICBwLnggPSB7XG4gICAgICAgICAgc2NhbGU6IG1vZGVsLnNjYWxlTmFtZShYKSxcbiAgICAgICAgICBmaWVsZDogbW9kZWwuZmllbGQoWCwgeyBiaW5TdWZmaXg6ICdfbWlkJyB9KVxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcC54ID0geyB2YWx1ZTogMCB9O1xuICAgICAgfVxuXG4gICAgICBpZiAobW9kZWwuaGFzKFgyKSkge1xuICAgICAgICBwLngyID0ge1xuICAgICAgICAgIHNjYWxlOiBtb2RlbC5zY2FsZU5hbWUoWCksXG4gICAgICAgICAgZmllbGQ6IG1vZGVsLmZpZWxkKFgyLCB7IGJpblN1ZmZpeDogJ19taWQnIH0pXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwLngyID0geyBmaWVsZDogeyBncm91cDogJ3dpZHRoJyB9IH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRklYTUU6IHRoaXMgZnVuY3Rpb24gd291bGQgb3ZlcndyaXRlIHN0cm9rZVdpZHRoIGJ1dCBzaG91bGRuJ3RcbiAgICBhcHBseUNvbG9yQW5kT3BhY2l0eShwLCBtb2RlbCk7XG5cbiAgICAvLyBzaXplXG4gICAgaWYgKG1vZGVsLmhhcyhTSVpFKSkge1xuICAgICAgcC5zdHJva2VXaWR0aCA9IHtcbiAgICAgICAgc2NhbGU6IG1vZGVsLnNjYWxlTmFtZShTSVpFKSxcbiAgICAgICAgZmllbGQ6IG1vZGVsLmZpZWxkKFNJWkUpXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBwLnN0cm9rZVdpZHRoID0geyB2YWx1ZTogc2l6ZVZhbHVlKG1vZGVsKSB9O1xuICAgIH1cbiAgICByZXR1cm4gcDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNpemVWYWx1ZShtb2RlbDogVW5pdE1vZGVsKSB7XG4gICAgY29uc3QgZmllbGREZWYgPSBtb2RlbC5maWVsZERlZihTSVpFKTtcbiAgICBpZiAoZmllbGREZWYgJiYgZmllbGREZWYudmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgIHJldHVybiBmaWVsZERlZi52YWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gbW9kZWwuY29uZmlnKCkubWFyay5ydWxlU2l6ZTtcbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiBsYWJlbHMobW9kZWw6IFVuaXRNb2RlbCkge1xuICAgIC8vIFRPRE8oIzI0MCk6IGZpbGwgdGhpcyBtZXRob2RcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG4iLCJpbXBvcnQge1VuaXRNb2RlbH0gZnJvbSAnLi4vdW5pdCc7XG5pbXBvcnQge1gsIFksIENPTE9SLCBURVhULCBTSVpFfSBmcm9tICcuLi8uLi9jaGFubmVsJztcbmltcG9ydCB7YXBwbHlNYXJrQ29uZmlnLCBhcHBseUNvbG9yQW5kT3BhY2l0eSwgZm9ybWF0TWl4aW5zfSBmcm9tICcuLi9jb21tb24nO1xuaW1wb3J0IHtleHRlbmQsIGNvbnRhaW5zfSBmcm9tICcuLi8uLi91dGlsJztcbmltcG9ydCB7UVVBTlRJVEFUSVZFLCBPUkRJTkFMLCBURU1QT1JBTH0gZnJvbSAnLi4vLi4vdHlwZSc7XG5cbmV4cG9ydCBuYW1lc3BhY2UgdGV4dCB7XG4gIGV4cG9ydCBmdW5jdGlvbiBtYXJrVHlwZSgpIHtcbiAgICByZXR1cm4gJ3RleHQnO1xuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIGJhY2tncm91bmQobW9kZWw6IFVuaXRNb2RlbCkge1xuICAgIHJldHVybiB7XG4gICAgICB4OiB7IHZhbHVlOiAwIH0sXG4gICAgICB5OiB7IHZhbHVlOiAwIH0sXG4gICAgICB3aWR0aDogeyBmaWVsZDogeyBncm91cDogJ3dpZHRoJyB9IH0sXG4gICAgICBoZWlnaHQ6IHsgZmllbGQ6IHsgZ3JvdXA6ICdoZWlnaHQnIH0gfSxcbiAgICAgIGZpbGw6IHtcbiAgICAgICAgc2NhbGU6IG1vZGVsLnNjYWxlTmFtZShDT0xPUiksXG4gICAgICAgIGZpZWxkOiBtb2RlbC5maWVsZChDT0xPUiwgbW9kZWwuZmllbGREZWYoQ09MT1IpLnR5cGUgPT09IE9SRElOQUwgPyB7cHJlZm46ICdyYW5rXyd9IDoge30pXG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiBwcm9wZXJ0aWVzKG1vZGVsOiBVbml0TW9kZWwpIHtcbiAgICAvLyBUT0RPIFVzZSBWZWdhJ3MgbWFya3MgcHJvcGVydGllcyBpbnRlcmZhY2VcbiAgICBsZXQgcDogYW55ID0ge307XG5cbiAgICBhcHBseU1hcmtDb25maWcocCwgbW9kZWwsXG4gICAgICBbJ2FuZ2xlJywgJ2FsaWduJywgJ2Jhc2VsaW5lJywgJ2R4JywgJ2R5JywgJ2ZvbnQnLCAnZm9udFdlaWdodCcsXG4gICAgICAgICdmb250U3R5bGUnLCAncmFkaXVzJywgJ3RoZXRhJywgJ3RleHQnXSk7XG5cbiAgICBjb25zdCBmaWVsZERlZiA9IG1vZGVsLmZpZWxkRGVmKFRFWFQpO1xuXG4gICAgLy8geFxuICAgIGlmIChtb2RlbC5oYXMoWCkpIHtcbiAgICAgIHAueCA9IHtcbiAgICAgICAgc2NhbGU6IG1vZGVsLnNjYWxlTmFtZShYKSxcbiAgICAgICAgZmllbGQ6IG1vZGVsLmZpZWxkKFgsIHsgYmluU3VmZml4OiAnX21pZCcgfSlcbiAgICAgIH07XG4gICAgfSBlbHNlIHsgLy8gVE9ETzogc3VwcG9ydCB4LnZhbHVlLCB4LmRhdHVtXG4gICAgICBpZiAobW9kZWwuaGFzKFRFWFQpICYmIG1vZGVsLmZpZWxkRGVmKFRFWFQpLnR5cGUgPT09IFFVQU5USVRBVElWRSkge1xuICAgICAgICBwLnggPSB7IGZpZWxkOiB7IGdyb3VwOiAnd2lkdGgnIH0sIG9mZnNldDogLTUgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHAueCA9IHsgdmFsdWU6IG1vZGVsLmNvbmZpZygpLnNjYWxlLnRleHRCYW5kV2lkdGggLyAyIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8geVxuICAgIGlmIChtb2RlbC5oYXMoWSkpIHtcbiAgICAgIHAueSA9IHtcbiAgICAgICAgc2NhbGU6IG1vZGVsLnNjYWxlTmFtZShZKSxcbiAgICAgICAgZmllbGQ6IG1vZGVsLmZpZWxkKFksIHsgYmluU3VmZml4OiAnX21pZCcgfSlcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHAueSA9IHsgdmFsdWU6IG1vZGVsLmNvbmZpZygpLnNjYWxlLmJhbmRTaXplIC8gMiB9O1xuICAgIH1cblxuICAgIC8vIHNpemVcbiAgICBpZiAobW9kZWwuaGFzKFNJWkUpKSB7XG4gICAgICBwLmZvbnRTaXplID0ge1xuICAgICAgICBzY2FsZTogbW9kZWwuc2NhbGVOYW1lKFNJWkUpLFxuICAgICAgICBmaWVsZDogbW9kZWwuZmllbGQoU0laRSlcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHAuZm9udFNpemUgPSB7IHZhbHVlOiBzaXplVmFsdWUobW9kZWwpIH07XG4gICAgfVxuXG4gICAgaWYgKG1vZGVsLmNvbmZpZygpLm1hcmsuYXBwbHlDb2xvclRvQmFja2dyb3VuZCAmJiAhbW9kZWwuaGFzKFgpICYmICFtb2RlbC5oYXMoWSkpIHtcbiAgICAgIHAuZmlsbCA9IHt2YWx1ZTogJ2JsYWNrJ307IC8vIFRPRE86IGFkZCBydWxlcyBmb3Igc3dhcHBpbmcgYmV0d2VlbiBibGFjayBhbmQgd2hpdGVcblxuICAgICAgLy8gb3BhY2l0eVxuICAgICAgY29uc3Qgb3BhY2l0eSA9IG1vZGVsLmNvbmZpZygpLm1hcmsub3BhY2l0eTtcbiAgICAgIGlmIChvcGFjaXR5KSB7IHAub3BhY2l0eSA9IHsgdmFsdWU6IG9wYWNpdHkgfTsgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXBwbHlDb2xvckFuZE9wYWNpdHkocCwgbW9kZWwpO1xuICAgIH1cblxuXG4gICAgLy8gdGV4dFxuICAgIGlmIChtb2RlbC5oYXMoVEVYVCkpIHtcbiAgICAgIGlmIChjb250YWlucyhbUVVBTlRJVEFUSVZFLCBURU1QT1JBTF0sIG1vZGVsLmZpZWxkRGVmKFRFWFQpLnR5cGUpKSB7XG4gICAgICAgIGNvbnN0IGRlZiA9IGZvcm1hdE1peGlucyhtb2RlbCwgZmllbGREZWYsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RlbC5jb25maWcoKS5tYXJrLmZvcm1hdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsLmNvbmZpZygpLm1hcmsuc2hvcnRUaW1lTGFiZWxzKTtcblxuICAgICAgICBleHRlbmQocCwgZm9ybWF0TWl4aW5zVGV4dChtb2RlbCwgZGVmKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwLnRleHQgPSB7IGZpZWxkOiBtb2RlbC5maWVsZChURVhUKSB9O1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZmllbGREZWYudmFsdWUpIHtcbiAgICAgIHAudGV4dCA9IHsgdmFsdWU6IGZpZWxkRGVmLnZhbHVlIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHA7XG4gIH1cblxuICBmdW5jdGlvbiBzaXplVmFsdWUobW9kZWw6IFVuaXRNb2RlbCkge1xuICAgIGNvbnN0IGZpZWxkRGVmID0gbW9kZWwuZmllbGREZWYoU0laRSk7XG4gICAgaWYgKGZpZWxkRGVmICYmIGZpZWxkRGVmLnZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICByZXR1cm4gZmllbGREZWYudmFsdWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1vZGVsLmNvbmZpZygpLm1hcmsuZm9udFNpemU7XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRNaXhpbnNUZXh0KG1vZGVsOiBVbml0TW9kZWwsIGRlZjogYW55KSB7XG4gIGNvbnN0IGZpbHRlciA9IChkZWYuZm9ybWF0VHlwZSB8fCAnbnVtYmVyJykgKyAoZGVmLmZvcm1hdCA/ICc6XFwnJyArIGRlZi5mb3JtYXQgKyAnXFwnJyA6ICcnKTtcbiAgcmV0dXJuIHtcbiAgICB0ZXh0OiB7XG4gICAgICAvLyBGSVhNRTogcmVtb3ZlIG1vZGVsLmZpZWxkICB1c2UgZmllbGRkZWYudHMncyBmaWVsZCBhbmQgcGFzcyBpbiBmaWVsZERlZlxuICAgICAgdGVtcGxhdGU6ICd7eycgKyBtb2RlbC5maWVsZChURVhULCB7IGRhdHVtOiB0cnVlIH0pICsgJyB8ICcgKyBmaWx0ZXIgKyAnfX0nXG4gICAgfVxuICB9O1xufVxufVxuIiwiaW1wb3J0IHtYLCBZLCBTSVpFLCBDaGFubmVsfSBmcm9tICcuLi8uLi9jaGFubmVsJztcblxuaW1wb3J0IHtVbml0TW9kZWx9IGZyb20gJy4uL3VuaXQnO1xuaW1wb3J0IHthcHBseUNvbG9yQW5kT3BhY2l0eX0gZnJvbSAnLi4vY29tbW9uJztcblxuZXhwb3J0IG5hbWVzcGFjZSB0aWNrIHtcbiAgZXhwb3J0IGZ1bmN0aW9uIG1hcmtUeXBlKCkge1xuICAgIHJldHVybiAncmVjdCc7XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gcHJvcGVydGllcyhtb2RlbDogVW5pdE1vZGVsKSB7XG4gICAgbGV0IHA6IGFueSA9IHt9O1xuXG4gICAgLy8gVE9ETzogc3VwcG9ydCBleHBsaWNpdCB2YWx1ZVxuXG4gICAgLy8geFxuICAgIGlmIChtb2RlbC5oYXMoWCkpIHtcbiAgICAgIHAueGMgPSB7XG4gICAgICAgIHNjYWxlOiBtb2RlbC5zY2FsZU5hbWUoWCksXG4gICAgICAgIGZpZWxkOiBtb2RlbC5maWVsZChYLCB7IGJpblN1ZmZpeDogJ19taWQnIH0pXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBwLnhjID0geyB2YWx1ZTogbW9kZWwuY29uZmlnKCkuc2NhbGUuYmFuZFNpemUgLyAyIH07XG4gICAgfVxuXG4gICAgLy8geVxuICAgIGlmIChtb2RlbC5oYXMoWSkpIHtcbiAgICAgIHAueWMgPSB7XG4gICAgICAgIHNjYWxlOiBtb2RlbC5zY2FsZU5hbWUoWSksXG4gICAgICAgIGZpZWxkOiBtb2RlbC5maWVsZChZLCB7IGJpblN1ZmZpeDogJ19taWQnIH0pXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBwLnljID0geyB2YWx1ZTogbW9kZWwuY29uZmlnKCkuc2NhbGUuYmFuZFNpemUgLyAyIH07XG4gICAgfVxuXG4gICAgaWYgKG1vZGVsLmNvbmZpZygpLm1hcmsub3JpZW50ID09PSAnaG9yaXpvbnRhbCcpIHtcbiAgICAgICBwLndpZHRoID0gbW9kZWwuaGFzKFNJWkUpPyB7XG4gICAgICAgICAgc2NhbGU6IG1vZGVsLnNjYWxlTmFtZShTSVpFKSxcbiAgICAgICAgICBmaWVsZDogbW9kZWwuZmllbGQoU0laRSlcbiAgICAgICAgfSA6IHtcbiAgICAgICAgICB2YWx1ZTogc2l6ZVZhbHVlKG1vZGVsLCBYKVxuICAgICAgICB9O1xuICAgICAgcC5oZWlnaHQgPSB7IHZhbHVlOiBtb2RlbC5jb25maWcoKS5tYXJrLnRpY2tUaGlja25lc3MgfTtcblxuICAgIH0gZWxzZSB7XG4gICAgICBwLndpZHRoID0geyB2YWx1ZTogbW9kZWwuY29uZmlnKCkubWFyay50aWNrVGhpY2tuZXNzIH07XG4gICAgICBwLmhlaWdodCA9IG1vZGVsLmhhcyhTSVpFKT8ge1xuICAgICAgICAgICAgc2NhbGU6IG1vZGVsLnNjYWxlTmFtZShTSVpFKSxcbiAgICAgICAgICAgIGZpZWxkOiBtb2RlbC5maWVsZChTSVpFKVxuICAgICAgICB9IDoge1xuICAgICAgICAgICAgdmFsdWU6IHNpemVWYWx1ZShtb2RlbCwgWSlcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBhcHBseUNvbG9yQW5kT3BhY2l0eShwLCBtb2RlbCk7XG4gICAgcmV0dXJuIHA7XG4gIH1cblxuICBmdW5jdGlvbiBzaXplVmFsdWUobW9kZWw6IFVuaXRNb2RlbCwgY2hhbm5lbDogQ2hhbm5lbCkge1xuICAgIGNvbnN0IGZpZWxkRGVmID0gbW9kZWwuZmllbGREZWYoU0laRSk7XG4gICAgaWYgKGZpZWxkRGVmICYmIGZpZWxkRGVmLnZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICByZXR1cm4gZmllbGREZWYudmFsdWU7XG4gICAgfVxuXG4gICAgY29uc3Qgc2NhbGVDb25maWcgPSBtb2RlbC5jb25maWcoKS5zY2FsZTtcbiAgICBjb25zdCBtYXJrQ29uZmlnID0gbW9kZWwuY29uZmlnKCkubWFyaztcblxuICAgIGlmIChtYXJrQ29uZmlnLnRpY2tTaXplKSB7XG4gICAgICByZXR1cm4gbWFya0NvbmZpZy50aWNrU2l6ZTtcbiAgICB9XG4gICAgY29uc3QgYmFuZFNpemUgPSBtb2RlbC5oYXMoY2hhbm5lbCkgP1xuICAgICAgbW9kZWwuc2NhbGUoY2hhbm5lbCkuYmFuZFNpemUgOlxuICAgICAgc2NhbGVDb25maWcuYmFuZFNpemU7XG4gICAgcmV0dXJuIGJhbmRTaXplIC8gMS41O1xuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIGxhYmVscyhtb2RlbDogVW5pdE1vZGVsKSB7XG4gICAgLy8gVE9ETygjMjQwKTogZmlsbCB0aGlzIG1ldGhvZFxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cbiIsImltcG9ydCB7QXhpc30gZnJvbSAnLi4vYXhpcyc7XG5pbXBvcnQge0NoYW5uZWwsIFgsIENPTFVNTn0gZnJvbSAnLi4vY2hhbm5lbCc7XG5pbXBvcnQge0NvbmZpZywgQ2VsbENvbmZpZ30gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCB7RGF0YSwgRGF0YVRhYmxlfSBmcm9tICcuLi9kYXRhJztcbmltcG9ydCB7Y2hhbm5lbE1hcHBpbmdSZWR1Y2UsIGNoYW5uZWxNYXBwaW5nRm9yRWFjaH0gZnJvbSAnLi4vZW5jb2RpbmcnO1xuaW1wb3J0IHtGaWVsZERlZiwgRmllbGRSZWZPcHRpb24sIGZpZWxkfSBmcm9tICcuLi9maWVsZGRlZic7XG5pbXBvcnQge0xlZ2VuZH0gZnJvbSAnLi4vbGVnZW5kJztcbmltcG9ydCB7U2NhbGUsIFNjYWxlVHlwZX0gZnJvbSAnLi4vc2NhbGUnO1xuaW1wb3J0IHtCYXNlU3BlY30gZnJvbSAnLi4vc3BlYyc7XG5pbXBvcnQge1RyYW5zZm9ybX0gZnJvbSAnLi4vdHJhbnNmb3JtJztcbmltcG9ydCB7ZXh0ZW5kLCBmbGF0dGVuLCB2YWxzLCB3YXJuaW5nLCBEaWN0fSBmcm9tICcuLi91dGlsJztcbmltcG9ydCB7VmdEYXRhLCBWZ01hcmtHcm91cCwgVmdTY2FsZSwgVmdBeGlzLCBWZ0xlZ2VuZH0gZnJvbSAnLi4vdmVnYS5zY2hlbWEnO1xuXG5pbXBvcnQge0RhdGFDb21wb25lbnR9IGZyb20gJy4vZGF0YS9kYXRhJztcbmltcG9ydCB7TGF5b3V0Q29tcG9uZW50fSBmcm9tICcuL2xheW91dCc7XG5pbXBvcnQge1NjYWxlQ29tcG9uZW50c30gZnJvbSAnLi9zY2FsZSc7XG5cbi8qKlxuICogQ29tcG9zYWJsZSBDb21wb25lbnRzIHRoYXQgYXJlIGludGVybWVkaWF0ZSByZXN1bHRzIG9mIHRoZSBwYXJzaW5nIHBoYXNlIG9mIHRoZVxuICogY29tcGlsYXRpb25zLiAgVGhlc2UgY29tcG9zYWJsZSBjb21wb25lbnRzIHdpbGwgYmUgYXNzZW1ibGVkIGluIHRoZSBsYXN0XG4gKiBjb21waWxhdGlvbiBzdGVwLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbXBvbmVudCB7XG4gIGRhdGE6IERhdGFDb21wb25lbnQ7XG4gIGxheW91dDogTGF5b3V0Q29tcG9uZW50O1xuICBzY2FsZTogRGljdDxTY2FsZUNvbXBvbmVudHM+O1xuXG4gIC8qKiBEaWN0aW9uYXJ5IG1hcHBpbmcgY2hhbm5lbCB0byBWZ0F4aXMgZGVmaW5pdGlvbiAqL1xuICAvLyBUT0RPOiBpZiB3ZSBhbGxvdyBtdWx0aXBsZSBheGVzIChlLmcuLCBkdWFsIGF4aXMpLCB0aGlzIHdpbGwgYmVjb21lIFZnQXhpc1tdXG4gIGF4aXM6IERpY3Q8VmdBeGlzPjtcblxuICAvKiogRGljdGlvbmFyeSBtYXBwaW5nIGNoYW5uZWwgdG8gVmdMZWdlbmQgZGVmaW5pdGlvbiAqL1xuICBsZWdlbmQ6IERpY3Q8VmdMZWdlbmQ+O1xuXG4gIC8qKiBEaWN0aW9uYXJ5IG1hcHBpbmcgY2hhbm5lbCB0byBheGlzIG1hcmsgZ3JvdXAgZm9yIGZhY2V0IGFuZCBjb25jYXQgKi9cbiAgYXhpc0dyb3VwOiBEaWN0PFZnTWFya0dyb3VwPjtcblxuICAvKiogRGljdGlvbmFyeSBtYXBwaW5nIGNoYW5uZWwgdG8gZ3JpZCBtYXJrIGdyb3VwIGZvciBmYWNldCAoYW5kIGNvbmNhdD8pICovXG4gIGdyaWRHcm91cDogRGljdDxWZ01hcmtHcm91cFtdPjtcblxuICBtYXJrOiBWZ01hcmtHcm91cFtdO1xufVxuXG5jbGFzcyBOYW1lTWFwIHtcbiAgcHJpdmF0ZSBfbmFtZU1hcDogRGljdDxzdHJpbmc+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX25hbWVNYXAgPSB7fSBhcyBEaWN0PHN0cmluZz47XG4gIH1cblxuICBwdWJsaWMgcmVuYW1lKG9sZE5hbWU6IHN0cmluZywgbmV3TmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5fbmFtZU1hcFtvbGROYW1lXSA9IG5ld05hbWU7XG4gIH1cblxuICBwdWJsaWMgZ2V0KG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8gSWYgdGhlIG5hbWUgYXBwZWFycyBpbiB0aGUgX25hbWVNYXAsIHdlIG5lZWQgdG8gcmVhZCBpdHMgbmV3IG5hbWUuXG4gICAgLy8gV2UgaGF2ZSB0byBsb29wIG92ZXIgdGhlIGRpY3QganVzdCBpbiBjYXNlLCB0aGUgbmV3IG5hbWUgYWxzbyBnZXRzIHJlbmFtZWQuXG4gICAgd2hpbGUgKHRoaXMuX25hbWVNYXBbbmFtZV0pIHtcbiAgICAgIG5hbWUgPSB0aGlzLl9uYW1lTWFwW25hbWVdO1xuICAgIH1cblxuICAgIHJldHVybiBuYW1lO1xuICB9XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNb2RlbCB7XG4gIHByb3RlY3RlZCBfcGFyZW50OiBNb2RlbDtcbiAgcHJvdGVjdGVkIF9uYW1lOiBzdHJpbmc7XG4gIHByb3RlY3RlZCBfZGVzY3JpcHRpb246IHN0cmluZztcblxuICBwcm90ZWN0ZWQgX2RhdGE6IERhdGE7XG5cbiAgLyoqIE5hbWUgbWFwIGZvciBkYXRhIHNvdXJjZXMsIHdoaWNoIGNhbiBiZSByZW5hbWVkIGJ5IGEgbW9kZWwncyBwYXJlbnQuICovXG4gIHByb3RlY3RlZCBfZGF0YU5hbWVNYXA6IE5hbWVNYXA7XG5cbiAgLyoqIE5hbWUgbWFwIGZvciBzY2FsZXMsIHdoaWNoIGNhbiBiZSByZW5hbWVkIGJ5IGEgbW9kZWwncyBwYXJlbnQuICovXG4gIHByb3RlY3RlZCBfc2NhbGVOYW1lTWFwOiBOYW1lTWFwO1xuXG4gIC8qKiBOYW1lIG1hcCBmb3Igc2l6ZSwgd2hpY2ggY2FuIGJlIHJlbmFtZWQgYnkgYSBtb2RlbCdzIHBhcmVudC4gKi9cbiAgcHJvdGVjdGVkIF9zaXplTmFtZU1hcDogTmFtZU1hcDtcblxuICBwcm90ZWN0ZWQgX3RyYW5zZm9ybTogVHJhbnNmb3JtO1xuICBwcm90ZWN0ZWQgX3NjYWxlOiBEaWN0PFNjYWxlPjtcblxuICBwcm90ZWN0ZWQgX2F4aXM6IERpY3Q8QXhpcz47XG5cbiAgcHJvdGVjdGVkIF9sZWdlbmQ6IERpY3Q8TGVnZW5kPjtcblxuICBwcm90ZWN0ZWQgX2NvbmZpZzogQ29uZmlnO1xuXG4gIHByb3RlY3RlZCBfd2FybmluZ3M6IHN0cmluZ1tdID0gW107XG5cbiAgcHVibGljIGNvbXBvbmVudDogQ29tcG9uZW50O1xuXG4gIGNvbnN0cnVjdG9yKHNwZWM6IEJhc2VTcGVjLCBwYXJlbnQ6IE1vZGVsLCBwYXJlbnRHaXZlbk5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuX3BhcmVudCA9IHBhcmVudDtcblxuICAgIC8vIElmIG5hbWUgaXMgbm90IHByb3ZpZGVkLCBhbHdheXMgdXNlIHBhcmVudCdzIGdpdmVuTmFtZSB0byBhdm9pZCBuYW1lIGNvbmZsaWN0cy5cbiAgICB0aGlzLl9uYW1lID0gc3BlYy5uYW1lIHx8IHBhcmVudEdpdmVuTmFtZTtcblxuICAgIC8vIFNoYXJlZCBuYW1lIG1hcHNcbiAgICB0aGlzLl9kYXRhTmFtZU1hcCA9IHBhcmVudCA/IHBhcmVudC5fZGF0YU5hbWVNYXAgOiBuZXcgTmFtZU1hcCgpO1xuICAgIHRoaXMuX3NjYWxlTmFtZU1hcCA9IHBhcmVudCA/IHBhcmVudC5fc2NhbGVOYW1lTWFwIDogbmV3IE5hbWVNYXAoKTtcbiAgICB0aGlzLl9zaXplTmFtZU1hcCA9IHBhcmVudCA/IHBhcmVudC5fc2l6ZU5hbWVNYXAgOiBuZXcgTmFtZU1hcCgpO1xuXG4gICAgdGhpcy5fZGF0YSA9IHNwZWMuZGF0YTtcblxuICAgIHRoaXMuX2Rlc2NyaXB0aW9uID0gc3BlYy5kZXNjcmlwdGlvbjtcbiAgICB0aGlzLl90cmFuc2Zvcm0gPSBzcGVjLnRyYW5zZm9ybTtcblxuICAgIHRoaXMuY29tcG9uZW50ID0ge2RhdGE6IG51bGwsIGxheW91dDogbnVsbCwgbWFyazogbnVsbCwgc2NhbGU6IG51bGwsIGF4aXM6IG51bGwsIGF4aXNHcm91cDogbnVsbCwgZ3JpZEdyb3VwOiBudWxsLCBsZWdlbmQ6IG51bGx9O1xuICB9XG5cblxuICBwdWJsaWMgcGFyc2UoKSB7XG4gICAgdGhpcy5wYXJzZURhdGEoKTtcbiAgICB0aGlzLnBhcnNlU2VsZWN0aW9uRGF0YSgpO1xuICAgIHRoaXMucGFyc2VMYXlvdXREYXRhKCk7XG4gICAgdGhpcy5wYXJzZVNjYWxlKCk7IC8vIGRlcGVuZHMgb24gZGF0YSBuYW1lXG4gICAgdGhpcy5wYXJzZUF4aXMoKTsgLy8gZGVwZW5kcyBvbiBzY2FsZSBuYW1lXG4gICAgdGhpcy5wYXJzZUxlZ2VuZCgpOyAvLyBkZXBlbmRzIG9uIHNjYWxlIG5hbWVcbiAgICB0aGlzLnBhcnNlQXhpc0dyb3VwKCk7IC8vIGRlcGVuZHMgb24gY2hpbGQgYXhpc1xuICAgIHRoaXMucGFyc2VHcmlkR3JvdXAoKTtcbiAgICB0aGlzLnBhcnNlTWFyaygpOyAvLyBkZXBlbmRzIG9uIGRhdGEgbmFtZSBhbmQgc2NhbGUgbmFtZSwgYXhpc0dyb3VwLCBncmlkR3JvdXAgYW5kIGNoaWxkcmVuJ3Mgc2NhbGUsIGF4aXMsIGxlZ2VuZCBhbmQgbWFyay5cbiAgfVxuXG4gIHB1YmxpYyBhYnN0cmFjdCBwYXJzZURhdGEoKTtcblxuICBwdWJsaWMgYWJzdHJhY3QgcGFyc2VTZWxlY3Rpb25EYXRhKCk7XG5cbiAgcHVibGljIGFic3RyYWN0IHBhcnNlTGF5b3V0RGF0YSgpO1xuXG4gIHB1YmxpYyBhYnN0cmFjdCBwYXJzZVNjYWxlKCk7XG5cbiAgcHVibGljIGFic3RyYWN0IHBhcnNlTWFyaygpO1xuXG4gIHB1YmxpYyBhYnN0cmFjdCBwYXJzZUF4aXMoKTtcblxuICBwdWJsaWMgYWJzdHJhY3QgcGFyc2VMZWdlbmQoKTtcblxuICAvLyBUT0RPOiByZXZpc2UgaWYgdGhlc2UgdHdvIG1ldGhvZHMgbWFrZSBzZW5zZSBmb3Igc2hhcmVkIHNjYWxlIGNvbmNhdFxuICBwdWJsaWMgYWJzdHJhY3QgcGFyc2VBeGlzR3JvdXAoKTtcbiAgcHVibGljIGFic3RyYWN0IHBhcnNlR3JpZEdyb3VwKCk7XG5cblxuICBwdWJsaWMgYWJzdHJhY3QgYXNzZW1ibGVEYXRhKGRhdGE6IFZnRGF0YVtdKTogVmdEYXRhW107XG5cbiAgcHVibGljIGFic3RyYWN0IGFzc2VtYmxlTGF5b3V0KGxheW91dERhdGE6IFZnRGF0YVtdKTogVmdEYXRhW107XG5cbiAgLy8gVE9ETzogZm9yIEFydmluZCB0byB3cml0ZVxuICAvLyBwdWJsaWMgYWJzdHJhY3QgYXNzZW1ibGVTZWxlY3Rpb25TaWduYWwobGF5b3V0RGF0YTogVmdEYXRhW10pOiBWZ0RhdGFbXTtcbiAgLy8gcHVibGljIGFic3RyYWN0IGFzc2VtYmxlU2VsZWN0aW9uRGF0YShsYXlvdXREYXRhOiBWZ0RhdGFbXSk6IFZnRGF0YVtdO1xuXG4gIHB1YmxpYyBhc3NlbWJsZVNjYWxlcygpOiBWZ1NjYWxlW10ge1xuICAgIC8vIEZJWE1FOiB3cml0ZSBhc3NlbWJsZVNjYWxlcygpIGluIHNjYWxlLnRzIHRoYXRcbiAgICAvLyBoZWxwIGFzc2VtYmxlIHNjYWxlIGRvbWFpbnMgd2l0aCBzY2FsZSBzaWduYXR1cmUgYXMgd2VsbFxuICAgIHJldHVybiBmbGF0dGVuKHZhbHModGhpcy5jb21wb25lbnQuc2NhbGUpLm1hcCgoc2NhbGVzOiBTY2FsZUNvbXBvbmVudHMpID0+IHtcbiAgICAgIGxldCBhcnIgPSBbc2NhbGVzLm1haW5dO1xuICAgICAgaWYgKHNjYWxlcy5jb2xvckxlZ2VuZCkge1xuICAgICAgICBhcnIucHVzaChzY2FsZXMuY29sb3JMZWdlbmQpO1xuICAgICAgfVxuICAgICAgaWYgKHNjYWxlcy5iaW5Db2xvckxlZ2VuZCkge1xuICAgICAgICBhcnIucHVzaChzY2FsZXMuYmluQ29sb3JMZWdlbmQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFycjtcbiAgICB9KSk7XG4gIH1cblxuICBwdWJsaWMgYWJzdHJhY3QgYXNzZW1ibGVNYXJrcygpOiBhbnlbXTsgLy8gVE9ETzogVmdNYXJrR3JvdXBbXVxuXG4gIHB1YmxpYyBhc3NlbWJsZUF4ZXMoKTogVmdBeGlzW10ge1xuICAgIHJldHVybiB2YWxzKHRoaXMuY29tcG9uZW50LmF4aXMpO1xuICB9XG5cbiAgcHVibGljIGFzc2VtYmxlTGVnZW5kcygpOiBhbnlbXSB7IC8vIFRPRE86IFZnTGVnZW5kW11cbiAgICByZXR1cm4gdmFscyh0aGlzLmNvbXBvbmVudC5sZWdlbmQpO1xuICB9XG5cbiAgcHVibGljIGFzc2VtYmxlR3JvdXAoKSB7XG4gICAgbGV0IGdyb3VwOiBWZ01hcmtHcm91cCA9IHt9O1xuXG4gICAgLy8gVE9ETzogY29uc2lkZXIgaWYgd2Ugd2FudCBzY2FsZXMgdG8gY29tZSBiZWZvcmUgbWFya3MgaW4gdGhlIG91dHB1dCBzcGVjLlxuXG4gICAgZ3JvdXAubWFya3MgPSB0aGlzLmFzc2VtYmxlTWFya3MoKTtcbiAgICBjb25zdCBzY2FsZXMgPSB0aGlzLmFzc2VtYmxlU2NhbGVzKCk7XG4gICAgaWYgKHNjYWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICBncm91cC5zY2FsZXMgPSBzY2FsZXM7XG4gICAgfVxuXG4gICAgY29uc3QgYXhlcyA9IHRoaXMuYXNzZW1ibGVBeGVzKCk7XG4gICAgaWYgKGF4ZXMubGVuZ3RoID4gMCkge1xuICAgICAgZ3JvdXAuYXhlcyA9IGF4ZXM7XG4gICAgfVxuXG4gICAgY29uc3QgbGVnZW5kcyA9IHRoaXMuYXNzZW1ibGVMZWdlbmRzKCk7XG4gICAgaWYgKGxlZ2VuZHMubGVuZ3RoID4gMCkge1xuICAgICAgZ3JvdXAubGVnZW5kcyA9IGxlZ2VuZHM7XG4gICAgfVxuXG4gICAgcmV0dXJuIGdyb3VwO1xuICB9XG5cbiAgcHVibGljIGFic3RyYWN0IGFzc2VtYmxlUGFyZW50R3JvdXBQcm9wZXJ0aWVzKGNlbGxDb25maWc6IENlbGxDb25maWcpO1xuXG4gIHB1YmxpYyBhYnN0cmFjdCBjaGFubmVscygpOiBDaGFubmVsW107XG5cbiAgcHJvdGVjdGVkIGFic3RyYWN0IG1hcHBpbmcoKTtcblxuICBwdWJsaWMgcmVkdWNlKGY6IChhY2M6IGFueSwgZmQ6IEZpZWxkRGVmLCBjOiBDaGFubmVsKSA9PiBhbnksIGluaXQsIHQ/OiBhbnkpIHtcbiAgICByZXR1cm4gY2hhbm5lbE1hcHBpbmdSZWR1Y2UodGhpcy5jaGFubmVscygpLCB0aGlzLm1hcHBpbmcoKSwgZiwgaW5pdCwgdCk7XG4gIH1cblxuICBwdWJsaWMgZm9yRWFjaChmOiAoZmQ6IEZpZWxkRGVmLCBjOiBDaGFubmVsLCBpOm51bWJlcikgPT4gdm9pZCwgdD86IGFueSkge1xuICAgIGNoYW5uZWxNYXBwaW5nRm9yRWFjaCh0aGlzLmNoYW5uZWxzKCksIHRoaXMubWFwcGluZygpLCBmLCB0KTtcbiAgfVxuXG4gIHB1YmxpYyBhYnN0cmFjdCBoYXMoY2hhbm5lbDogQ2hhbm5lbCk6IGJvb2xlYW47XG5cbiAgcHVibGljIHBhcmVudCgpOiBNb2RlbCB7XG4gICAgcmV0dXJuIHRoaXMuX3BhcmVudDtcbiAgfVxuXG4gIHB1YmxpYyBuYW1lKHRleHQ6IHN0cmluZywgZGVsaW1pdGVyOiBzdHJpbmcgPSAnXycpIHtcbiAgICByZXR1cm4gKHRoaXMuX25hbWUgPyB0aGlzLl9uYW1lICsgZGVsaW1pdGVyIDogJycpICsgdGV4dDtcbiAgfVxuXG4gIHB1YmxpYyBkZXNjcmlwdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fZGVzY3JpcHRpb247XG4gIH1cblxuICBwdWJsaWMgZGF0YSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YTtcbiAgfVxuXG4gIHB1YmxpYyByZW5hbWVEYXRhKG9sZE5hbWU6IHN0cmluZywgbmV3TmFtZTogc3RyaW5nKSB7XG4gICAgIHRoaXMuX2RhdGFOYW1lTWFwLnJlbmFtZShvbGROYW1lLCBuZXdOYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIGRhdGEgc291cmNlIG5hbWUgZm9yIHRoZSBnaXZlbiBkYXRhIHNvdXJjZSB0eXBlLlxuICAgKlxuICAgKiBGb3IgdW5pdCBzcGVjLCB0aGlzIGlzIGFsd2F5cyBzaW1wbHkgdGhlIHNwZWMubmFtZSArICctJyArIGRhdGFTb3VyY2VUeXBlLlxuICAgKiBXZSBhbHJlYWR5IHVzZSB0aGUgbmFtZSBtYXAgc28gdGhhdCBtYXJrcyBhbmQgc2NhbGVzIHVzZSB0aGUgY29ycmVjdCBkYXRhLlxuICAgKi9cbiAgcHVibGljIGRhdGFOYW1lKGRhdGFTb3VyY2VUeXBlOiBEYXRhVGFibGUpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9kYXRhTmFtZU1hcC5nZXQodGhpcy5uYW1lKFN0cmluZyhkYXRhU291cmNlVHlwZSkpKTtcbiAgfVxuXG4gIHB1YmxpYyByZW5hbWVTaXplKG9sZE5hbWU6IHN0cmluZywgbmV3TmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5fc2l6ZU5hbWVNYXAucmVuYW1lKG9sZE5hbWUsIG5ld05hbWUpO1xuICB9XG5cbiAgcHVibGljIGNoYW5uZWxTaXplTmFtZShjaGFubmVsOiBDaGFubmVsKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5zaXplTmFtZShjaGFubmVsID09PSBYIHx8IGNoYW5uZWwgPT09IENPTFVNTiA/ICd3aWR0aCcgOiAnaGVpZ2h0Jyk7XG4gIH1cblxuICBwdWJsaWMgc2l6ZU5hbWUoc2l6ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgcmV0dXJuIHRoaXMuX3NpemVOYW1lTWFwLmdldCh0aGlzLm5hbWUoc2l6ZSwgJ18nKSk7XG4gIH1cblxuICBwdWJsaWMgYWJzdHJhY3QgZGF0YVRhYmxlKCk6IHN0cmluZztcblxuICBwdWJsaWMgdHJhbnNmb3JtKCk6IFRyYW5zZm9ybSB7XG4gICAgcmV0dXJuIHRoaXMuX3RyYW5zZm9ybSB8fCB7fTtcbiAgfVxuXG4gIC8qKiBHZXQgXCJmaWVsZFwiIHJlZmVyZW5jZSBmb3IgdmVnYSAqL1xuICBwdWJsaWMgZmllbGQoY2hhbm5lbDogQ2hhbm5lbCwgb3B0OiBGaWVsZFJlZk9wdGlvbiA9IHt9KSB7XG4gICAgY29uc3QgZmllbGREZWYgPSB0aGlzLmZpZWxkRGVmKGNoYW5uZWwpO1xuXG4gICAgaWYgKGZpZWxkRGVmLmJpbikgeyAvLyBiaW4gaGFzIGRlZmF1bHQgc3VmZml4IHRoYXQgZGVwZW5kcyBvbiBzY2FsZVR5cGVcbiAgICAgIG9wdCA9IGV4dGVuZCh7XG4gICAgICAgIGJpblN1ZmZpeDogdGhpcy5zY2FsZShjaGFubmVsKS50eXBlID09PSBTY2FsZVR5cGUuT1JESU5BTCA/ICdfcmFuZ2UnIDogJ19zdGFydCdcbiAgICAgIH0sIG9wdCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpZWxkKGZpZWxkRGVmLCBvcHQpO1xuICB9XG5cbiAgcHVibGljIGFic3RyYWN0IGZpZWxkRGVmKGNoYW5uZWw6IENoYW5uZWwpOiBGaWVsZERlZjtcblxuICBwdWJsaWMgc2NhbGUoY2hhbm5lbDogQ2hhbm5lbCk6IFNjYWxlIHtcbiAgICByZXR1cm4gdGhpcy5fc2NhbGVbY2hhbm5lbF07XG4gIH1cblxuICAvLyBUT0RPOiByZW5hbWUgdG8gaGFzT3JkaW5hbFNjYWxlXG4gIHB1YmxpYyBpc09yZGluYWxTY2FsZShjaGFubmVsOiBDaGFubmVsKSB7XG4gICAgY29uc3Qgc2NhbGUgPSB0aGlzLnNjYWxlKGNoYW5uZWwpO1xuICAgIHJldHVybiBzY2FsZSAmJiBzY2FsZS50eXBlID09PSBTY2FsZVR5cGUuT1JESU5BTDtcbiAgfVxuXG4gIHB1YmxpYyByZW5hbWVTY2FsZShvbGROYW1lOiBzdHJpbmcsIG5ld05hbWU6IHN0cmluZykge1xuICAgIHRoaXMuX3NjYWxlTmFtZU1hcC5yZW5hbWUob2xkTmFtZSwgbmV3TmFtZSk7XG4gIH1cblxuICAvKiogcmV0dXJucyBzY2FsZSBuYW1lIGZvciBhIGdpdmVuIGNoYW5uZWwgKi9cbiAgcHVibGljIHNjYWxlTmFtZShjaGFubmVsOiBDaGFubmVsfHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3NjYWxlTmFtZU1hcC5nZXQodGhpcy5uYW1lKGNoYW5uZWwgKyAnJykpO1xuICB9XG5cbiAgcHVibGljIHNvcnQoY2hhbm5lbDogQ2hhbm5lbCkge1xuICAgIHJldHVybiAodGhpcy5tYXBwaW5nKClbY2hhbm5lbF0gfHwge30pLnNvcnQ7XG4gIH1cblxuICBwdWJsaWMgYWJzdHJhY3Qgc3RhY2soKTtcblxuICBwdWJsaWMgYXhpcyhjaGFubmVsOiBDaGFubmVsKTogQXhpcyB7XG4gICAgcmV0dXJuIHRoaXMuX2F4aXNbY2hhbm5lbF07XG4gIH1cblxuICBwdWJsaWMgbGVnZW5kKGNoYW5uZWw6IENoYW5uZWwpOiBMZWdlbmQge1xuICAgIHJldHVybiB0aGlzLl9sZWdlbmRbY2hhbm5lbF07XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBzcGVjIGNvbmZpZ3VyYXRpb24uXG4gICAqL1xuICBwdWJsaWMgY29uZmlnKCk6IENvbmZpZyB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbmZpZztcbiAgfVxuXG4gIHB1YmxpYyBhZGRXYXJuaW5nKG1lc3NhZ2U6IHN0cmluZykge1xuICAgIHdhcm5pbmcobWVzc2FnZSk7XG4gICAgdGhpcy5fd2FybmluZ3MucHVzaChtZXNzYWdlKTtcbiAgfVxuXG4gIHB1YmxpYyB3YXJuaW5ncygpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIHRoaXMuX3dhcm5pbmdzO1xuICB9XG5cbiAgLyoqXG4gICAqIFR5cGUgY2hlY2tzXG4gICAqL1xuICBwdWJsaWMgaXNVbml0KCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBwdWJsaWMgaXNGYWNldCgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcHVibGljIGlzTGF5ZXIoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG4iLCIvLyBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvYmxvYi9tYXN0ZXIvZG9jL3NwZWMubWQjMTEtYW1iaWVudC1kZWNsYXJhdGlvbnNcbmRlY2xhcmUgdmFyIGV4cG9ydHM7XG5cbmltcG9ydCB7U0hBUkVEX0RPTUFJTl9PUFN9IGZyb20gJy4uL2FnZ3JlZ2F0ZSc7XG5pbXBvcnQge0NPTFVNTiwgUk9XLCBYLCBZLCBYMiwgWTIsIFNIQVBFLCBTSVpFLCBDT0xPUiwgT1BBQ0lUWSwgVEVYVCwgaGFzU2NhbGUsIENoYW5uZWx9IGZyb20gJy4uL2NoYW5uZWwnO1xuaW1wb3J0IHtTdGFja09mZnNldH0gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCB7U09VUkNFLCBTVEFDS0VEX1NDQUxFfSBmcm9tICcuLi9kYXRhJztcbmltcG9ydCB7RmllbGREZWYsIGZpZWxkLCBpc01lYXN1cmV9IGZyb20gJy4uL2ZpZWxkZGVmJztcbmltcG9ydCB7TWFyaywgQkFSLCBURVhUIGFzIFRFWFRfTUFSSywgUlVMRSwgVElDS30gZnJvbSAnLi4vbWFyayc7XG5pbXBvcnQge1NjYWxlLCBTY2FsZVR5cGUsIE5pY2VUaW1lfSBmcm9tICcuLi9zY2FsZSc7XG5pbXBvcnQge1RpbWVVbml0fSBmcm9tICcuLi90aW1ldW5pdCc7XG5pbXBvcnQge05PTUlOQUwsIE9SRElOQUwsIFFVQU5USVRBVElWRSwgVEVNUE9SQUx9IGZyb20gJy4uL3R5cGUnO1xuaW1wb3J0IHtjb250YWlucywgZXh0ZW5kLCBEaWN0fSBmcm9tICcuLi91dGlsJztcbmltcG9ydCB7VmdTY2FsZX0gZnJvbSAnLi4vdmVnYS5zY2hlbWEnO1xuXG5pbXBvcnQge01vZGVsfSBmcm9tICcuL21vZGVsJztcbmltcG9ydCB7cmF3RG9tYWluLCBzbWFsbGVzdFVuaXR9IGZyb20gJy4vdGltZSc7XG5pbXBvcnQge1VuaXRNb2RlbH0gZnJvbSAnLi91bml0JztcblxuLyoqXG4gKiBDb2xvciBSYW1wJ3Mgc2NhbGUgZm9yIGxlZ2VuZHMuICBUaGlzIHNjYWxlIGhhcyB0byBiZSBvcmRpbmFsIHNvIHRoYXQgaXRzXG4gKiBsZWdlbmRzIHNob3cgYSBsaXN0IG9mIG51bWJlcnMuXG4gKi9cbmV4cG9ydCBjb25zdCBDT0xPUl9MRUdFTkQgPSAnY29sb3JfbGVnZW5kJztcblxuLy8gc2NhbGUgdXNlZCB0byBnZXQgbGFiZWxzIGZvciBiaW5uZWQgY29sb3Igc2NhbGVzXG5leHBvcnQgY29uc3QgQ09MT1JfTEVHRU5EX0xBQkVMID0gJ2NvbG9yX2xlZ2VuZF9sYWJlbCc7XG5cblxuLy8gRklYTUU6IFdpdGggbGF5ZXIgYW5kIGNvbmNhdCwgc2NhbGVDb21wb25lbnQgc2hvdWxkIGRlY29tcG9zZSBiZXR3ZWVuXG4vLyBTY2FsZVNpZ25hdHVyZSBhbmQgU2NhbGVEb21haW5bXS5cbi8vIEJhc2ljYWxseSwgaWYgdHdvIHVuaXQgc3BlY3MgaGFzIHRoZSBzYW1lIHNjYWxlLCBzaWduYXR1cmUgZm9yIGEgcGFydGljdWxhciBjaGFubmVsLFxuLy8gdGhlIHNjYWxlIGNhbiBiZSB1bmlvbmVkIGJ5IGNvbWJpbmluZyB0aGUgZG9tYWluLlxuZXhwb3J0IHR5cGUgU2NhbGVDb21wb25lbnQgPSBWZ1NjYWxlO1xuXG5leHBvcnQgdHlwZSBTY2FsZUNvbXBvbmVudHMgPSB7XG4gIG1haW46IFNjYWxlQ29tcG9uZW50O1xuICBjb2xvckxlZ2VuZD86IFNjYWxlQ29tcG9uZW50LFxuICBiaW5Db2xvckxlZ2VuZD86IFNjYWxlQ29tcG9uZW50XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVNjYWxlQ29tcG9uZW50KG1vZGVsOiBNb2RlbCk6IERpY3Q8U2NhbGVDb21wb25lbnRzPiB7XG4gIC8vIFRPRE86IHNob3VsZCBtb2RlbC5jaGFubmVscygpIGlubGN1ZGUgWDIvWTI/XG4gIHJldHVybiBtb2RlbC5jaGFubmVscygpLnJlZHVjZShmdW5jdGlvbihzY2FsZTogRGljdDxTY2FsZUNvbXBvbmVudHM+LCBjaGFubmVsOiBDaGFubmVsKSB7XG4gICAgICBpZiAobW9kZWwuc2NhbGUoY2hhbm5lbCkpIHtcbiAgICAgICAgY29uc3QgZmllbGREZWYgPSBtb2RlbC5maWVsZERlZihjaGFubmVsKTtcbiAgICAgICAgY29uc3Qgc2NhbGVzOiBTY2FsZUNvbXBvbmVudHMgPSB7XG4gICAgICAgICAgbWFpbjogcGFyc2VNYWluU2NhbGUobW9kZWwsIGZpZWxkRGVmLCBjaGFubmVsKVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEFkZCBhZGRpdGlvbmFsIHNjYWxlcyBuZWVkZWQgdG8gc3VwcG9ydCBvcmRpbmFsIGxlZ2VuZHMgKGxpc3Qgb2YgdmFsdWVzKVxuICAgICAgICAvLyBmb3IgY29sb3IgcmFtcC5cbiAgICAgICAgaWYgKGNoYW5uZWwgPT09IENPTE9SICYmIG1vZGVsLmxlZ2VuZChDT0xPUikgJiYgKGZpZWxkRGVmLnR5cGUgPT09IE9SRElOQUwgfHwgZmllbGREZWYuYmluIHx8IGZpZWxkRGVmLnRpbWVVbml0KSkge1xuICAgICAgICAgIHNjYWxlcy5jb2xvckxlZ2VuZCA9IHBhcnNlQ29sb3JMZWdlbmRTY2FsZShtb2RlbCwgZmllbGREZWYpO1xuICAgICAgICAgIGlmIChmaWVsZERlZi5iaW4pIHtcbiAgICAgICAgICAgIHNjYWxlcy5iaW5Db2xvckxlZ2VuZCA9IHBhcnNlQmluQ29sb3JMZWdlbmRMYWJlbChtb2RlbCwgZmllbGREZWYpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHNjYWxlW2NoYW5uZWxdID0gc2NhbGVzO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNjYWxlO1xuICAgIH0sIHt9IGFzIERpY3Q8U2NhbGVDb21wb25lbnRzPik7XG59XG5cbi8qKlxuICogUmV0dXJuIHRoZSBtYWluIHNjYWxlIGZvciBlYWNoIGNoYW5uZWwuICAoT25seSBjb2xvciBjYW4gaGF2ZSBtdWx0aXBsZSBzY2FsZXMuKVxuICovXG5mdW5jdGlvbiBwYXJzZU1haW5TY2FsZShtb2RlbDogTW9kZWwsIGZpZWxkRGVmOiBGaWVsZERlZiwgY2hhbm5lbDogQ2hhbm5lbCkge1xuICBjb25zdCBzY2FsZSA9IG1vZGVsLnNjYWxlKGNoYW5uZWwpO1xuICBjb25zdCBzb3J0ID0gbW9kZWwuc29ydChjaGFubmVsKTtcbiAgbGV0IHNjYWxlRGVmOiBhbnkgPSB7XG4gICAgbmFtZTogbW9kZWwuc2NhbGVOYW1lKGNoYW5uZWwpLFxuICAgIHR5cGU6IHNjYWxlLnR5cGUsXG4gIH07XG5cbiAgLy8gSWYgY2hhbm5lbCBpcyBlaXRoZXIgWCBvciBZIHRoZW4gdW5pb24gdGhlbSB3aXRoIFgyICYgWTIgaWYgdGhleSBleGlzdCBcbiAgaWYgKGNoYW5uZWwgPT09IFggJiYgbW9kZWwuaGFzKFgyKSkge1xuICAgIGlmIChtb2RlbC5oYXMoWCkpIHtcbiAgICAgIHNjYWxlRGVmLmRvbWFpbiA9IHsgZmllbGRzOiBbZG9tYWluKHNjYWxlLCBtb2RlbCwgWCksIGRvbWFpbihzY2FsZSwgbW9kZWwsIFgyKV0gfTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2NhbGVEZWYuZG9tYWluID0gZG9tYWluKHNjYWxlLCBtb2RlbCwgWDIpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChjaGFubmVsID09PSBZICYmIG1vZGVsLmhhcyhZMikpIHtcbiAgICAgIGlmIChtb2RlbC5oYXMoWSkpIHtcbiAgICAgICAgc2NhbGVEZWYuZG9tYWluID0geyBmaWVsZHM6IFtkb21haW4oc2NhbGUsIG1vZGVsLCBZKSwgZG9tYWluKHNjYWxlLCBtb2RlbCwgWTIpXSB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2NhbGVEZWYuZG9tYWluID0gZG9tYWluKHNjYWxlLCBtb2RlbCwgWTIpO1xuICAgICAgfVxuICB9IGVsc2Uge1xuICAgIHNjYWxlRGVmLmRvbWFpbiA9IGRvbWFpbihzY2FsZSwgbW9kZWwsIGNoYW5uZWwpO1xuICB9XG5cbiAgZXh0ZW5kKHNjYWxlRGVmLCByYW5nZU1peGlucyhzY2FsZSwgbW9kZWwsIGNoYW5uZWwpKTtcbiAgaWYgKHNvcnQgJiYgKHR5cGVvZiBzb3J0ID09PSAnc3RyaW5nJyA/IHNvcnQgOiBzb3J0Lm9yZGVyKSA9PT0gJ2Rlc2NlbmRpbmcnKSB7XG4gICAgc2NhbGVEZWYucmV2ZXJzZSA9IHRydWU7XG4gIH1cblxuICAvLyBBZGQgb3B0aW9uYWwgcHJvcGVydGllc1xuICBbXG4gICAgLy8gZ2VuZXJhbCBwcm9wZXJ0aWVzXG4gICAgJ3JvdW5kJyxcbiAgICAvLyBxdWFudGl0YXRpdmUgLyB0aW1lXG4gICAgJ2NsYW1wJywgJ25pY2UnLFxuICAgIC8vIHF1YW50aXRhdGl2ZVxuICAgICdleHBvbmVudCcsICd6ZXJvJyxcbiAgICAvLyBvcmRpbmFsXG4gICAgJ3BhZGRpbmcnLCAncG9pbnRzJ1xuICBdLmZvckVhY2goZnVuY3Rpb24ocHJvcGVydHkpIHtcbiAgICBjb25zdCB2YWx1ZSA9IGV4cG9ydHNbcHJvcGVydHldKHNjYWxlLCBjaGFubmVsLCBmaWVsZERlZiwgbW9kZWwpO1xuICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzY2FsZURlZltwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBzY2FsZURlZjtcbn1cblxuLyoqXG4gKiAgUmV0dXJuIGEgc2NhbGUgIGZvciBwcm9kdWNpbmcgb3JkaW5hbCBzY2FsZSBmb3IgbGVnZW5kcy5cbiAqICAtIEZvciBhbiBvcmRpbmFsIGZpZWxkLCBwcm92aWRlIGFuIG9yZGluYWwgc2NhbGUgdGhhdCBtYXBzIHJhbmsgdmFsdWVzIHRvIGZpZWxkIHZhbHVlXG4gKiAgLSBGb3IgYSBmaWVsZCB3aXRoIGJpbiBvciB0aW1lVW5pdCwgcHJvdmlkZSBhbiBpZGVudGl0eSBvcmRpbmFsIHNjYWxlXG4gKiAgICAobWFwcGluZyB0aGUgZmllbGQgdmFsdWVzIHRvIHRoZW1zZWx2ZXMpXG4gKi9cbmZ1bmN0aW9uIHBhcnNlQ29sb3JMZWdlbmRTY2FsZShtb2RlbDogTW9kZWwsIGZpZWxkRGVmOiBGaWVsZERlZik6IFNjYWxlQ29tcG9uZW50IHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBtb2RlbC5zY2FsZU5hbWUoQ09MT1JfTEVHRU5EKSxcbiAgICB0eXBlOiBTY2FsZVR5cGUuT1JESU5BTCxcbiAgICBkb21haW46IHtcbiAgICAgIGRhdGE6IG1vZGVsLmRhdGFUYWJsZSgpLFxuICAgICAgLy8gdXNlIHJhbmtfPGZpZWxkPiBmb3Igb3JkaW5hbCB0eXBlLCBmb3IgYmluIGFuZCB0aW1lVW5pdCB1c2UgZGVmYXVsdCBmaWVsZFxuICAgICAgZmllbGQ6IG1vZGVsLmZpZWxkKENPTE9SLCAoZmllbGREZWYuYmluIHx8IGZpZWxkRGVmLnRpbWVVbml0KSA/IHt9IDoge3ByZWZuOiAncmFua18nfSksXG4gICAgICBzb3J0OiB0cnVlXG4gICAgfSxcbiAgICByYW5nZToge2RhdGE6IG1vZGVsLmRhdGFUYWJsZSgpLCBmaWVsZDogbW9kZWwuZmllbGQoQ09MT1IpLCBzb3J0OiB0cnVlfVxuICB9O1xufVxuXG4vKipcbiAqICBSZXR1cm4gYW4gYWRkaXRpb25hbCBzY2FsZSBmb3IgYmluIGxhYmVscyBiZWNhdXNlIHdlIG5lZWQgdG8gbWFwIGJpbl9zdGFydCB0byBiaW5fcmFuZ2UgaW4gbGVnZW5kc1xuICovXG5mdW5jdGlvbiBwYXJzZUJpbkNvbG9yTGVnZW5kTGFiZWwobW9kZWw6IE1vZGVsLCBmaWVsZERlZjogRmllbGREZWYpOiBTY2FsZUNvbXBvbmVudCB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogbW9kZWwuc2NhbGVOYW1lKENPTE9SX0xFR0VORF9MQUJFTCksXG4gICAgdHlwZTogU2NhbGVUeXBlLk9SRElOQUwsXG4gICAgZG9tYWluOiB7XG4gICAgICBkYXRhOiBtb2RlbC5kYXRhVGFibGUoKSxcbiAgICAgIGZpZWxkOiBtb2RlbC5maWVsZChDT0xPUiksXG4gICAgICBzb3J0OiB0cnVlXG4gICAgfSxcbiAgICByYW5nZToge1xuICAgICAgZGF0YTogbW9kZWwuZGF0YVRhYmxlKCksXG4gICAgICBmaWVsZDogZmllbGQoZmllbGREZWYsIHtiaW5TdWZmaXg6ICdfcmFuZ2UnfSksXG4gICAgICBzb3J0OiB7XG4gICAgICAgIGZpZWxkOiBtb2RlbC5maWVsZChDT0xPUiwgeyBiaW5TdWZmaXg6ICdfc3RhcnQnIH0pLFxuICAgICAgICBvcDogJ21pbicgLy8gbWluIG9yIG1heCBkb2Vzbid0IG1hdHRlciBzaW5jZSBzYW1lIF9yYW5nZSB3b3VsZCBoYXZlIHRoZSBzYW1lIF9zdGFydFxuICAgICAgfVxuICAgIH1cbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlVHlwZShzY2FsZTogU2NhbGUsIGZpZWxkRGVmOiBGaWVsZERlZiwgY2hhbm5lbDogQ2hhbm5lbCwgbWFyazogTWFyayk6IFNjYWxlVHlwZSB7XG4gIGlmICghaGFzU2NhbGUoY2hhbm5lbCkpIHtcbiAgICAvLyBUaGVyZSBpcyBubyBzY2FsZSBmb3IgdGhlc2UgY2hhbm5lbHNcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIFdlIGNhbid0IHVzZSBsaW5lYXIvdGltZSBmb3Igcm93LCBjb2x1bW4gb3Igc2hhcGVcbiAgaWYgKGNvbnRhaW5zKFtST1csIENPTFVNTiwgU0hBUEVdLCBjaGFubmVsKSkge1xuICAgIHJldHVybiBTY2FsZVR5cGUuT1JESU5BTDtcbiAgfVxuXG4gIGlmIChzY2FsZS50eXBlICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gc2NhbGUudHlwZTtcbiAgfVxuXG4gIHN3aXRjaCAoZmllbGREZWYudHlwZSkge1xuICAgIGNhc2UgTk9NSU5BTDpcbiAgICAgIHJldHVybiBTY2FsZVR5cGUuT1JESU5BTDtcbiAgICBjYXNlIE9SRElOQUw6XG4gICAgICBpZiAoY2hhbm5lbCA9PT0gQ09MT1IpIHtcbiAgICAgICAgcmV0dXJuIFNjYWxlVHlwZS5MSU5FQVI7IC8vIHRpbWUgaGFzIG9yZGVyLCBzbyB1c2UgaW50ZXJwb2xhdGVkIG9yZGluYWwgY29sb3Igc2NhbGUuXG4gICAgICB9XG4gICAgICByZXR1cm4gU2NhbGVUeXBlLk9SRElOQUw7XG4gICAgY2FzZSBURU1QT1JBTDpcbiAgICAgIGlmIChjaGFubmVsID09PSBDT0xPUikge1xuICAgICAgICByZXR1cm4gU2NhbGVUeXBlLlRJTUU7IC8vIHRpbWUgaGFzIG9yZGVyLCBzbyB1c2UgaW50ZXJwb2xhdGVkIG9yZGluYWwgY29sb3Igc2NhbGUuXG4gICAgICB9XG5cbiAgICAgIGlmIChmaWVsZERlZi50aW1lVW5pdCkge1xuICAgICAgICBzd2l0Y2ggKGZpZWxkRGVmLnRpbWVVbml0KSB7XG4gICAgICAgICAgY2FzZSBUaW1lVW5pdC5IT1VSUzpcbiAgICAgICAgICBjYXNlIFRpbWVVbml0LkRBWTpcbiAgICAgICAgICBjYXNlIFRpbWVVbml0Lk1PTlRIOlxuICAgICAgICAgICAgcmV0dXJuIFNjYWxlVHlwZS5PUkRJTkFMO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvLyBkYXRlLCB5ZWFyLCBtaW51dGUsIHNlY29uZCwgeWVhcm1vbnRoLCBtb250aGRheSwgLi4uXG4gICAgICAgICAgICByZXR1cm4gU2NhbGVUeXBlLlRJTUU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBTY2FsZVR5cGUuVElNRTtcblxuICAgIGNhc2UgUVVBTlRJVEFUSVZFOlxuICAgICAgaWYgKGZpZWxkRGVmLmJpbikge1xuICAgICAgICByZXR1cm4gY29udGFpbnMoW1gsIFksIENPTE9SXSwgY2hhbm5lbCkgPyBTY2FsZVR5cGUuTElORUFSIDogU2NhbGVUeXBlLk9SRElOQUw7XG4gICAgICB9XG4gICAgICByZXR1cm4gU2NhbGVUeXBlLkxJTkVBUjtcbiAgfVxuXG4gIC8vIHNob3VsZCBuZXZlciByZWFjaCB0aGlzXG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZG9tYWluKHNjYWxlOiBTY2FsZSwgbW9kZWw6IE1vZGVsLCBjaGFubmVsOkNoYW5uZWwpOiBhbnkge1xuICBjb25zdCBmaWVsZERlZiA9IG1vZGVsLmZpZWxkRGVmKGNoYW5uZWwpO1xuXG4gIGlmIChzY2FsZS5kb21haW4pIHsgLy8gZXhwbGljaXQgdmFsdWVcbiAgICByZXR1cm4gc2NhbGUuZG9tYWluO1xuICB9XG5cbiAgLy8gc3BlY2lhbCBjYXNlIGZvciB0ZW1wb3JhbCBzY2FsZVxuICBpZiAoZmllbGREZWYudHlwZSA9PT0gVEVNUE9SQUwpIHtcbiAgICBpZiAocmF3RG9tYWluKGZpZWxkRGVmLnRpbWVVbml0LCBjaGFubmVsKSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGF0YTogZmllbGREZWYudGltZVVuaXQsXG4gICAgICAgIGZpZWxkOiAnZGF0ZSdcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGRhdGE6IG1vZGVsLmRhdGFUYWJsZSgpLFxuICAgICAgZmllbGQ6IG1vZGVsLmZpZWxkKGNoYW5uZWwpLFxuICAgICAgc29ydDoge1xuICAgICAgICBmaWVsZDogbW9kZWwuZmllbGQoY2hhbm5lbCksXG4gICAgICAgIG9wOiAnbWluJ1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvLyBGb3Igc3RhY2ssIHVzZSBTVEFDS0VEIGRhdGEuXG4gIGNvbnN0IHN0YWNrID0gbW9kZWwuc3RhY2soKTtcbiAgaWYgKHN0YWNrICYmIGNoYW5uZWwgPT09IHN0YWNrLmZpZWxkQ2hhbm5lbCkge1xuICAgIGlmKHN0YWNrLm9mZnNldCA9PT0gU3RhY2tPZmZzZXQuTk9STUFMSVpFKSB7XG4gICAgICByZXR1cm4gWzAsIDFdO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgZGF0YTogbW9kZWwuZGF0YU5hbWUoU1RBQ0tFRF9TQ0FMRSksXG4gICAgICAvLyBTVEFDS0VEX1NDQUxFIHByb2R1Y2VzIHN1bSBvZiB0aGUgZmllbGQncyB2YWx1ZSBlLmcuLCBzdW0gb2Ygc3VtLCBzdW0gb2YgZGlzdGluY3RcbiAgICAgIGZpZWxkOiBtb2RlbC5maWVsZChjaGFubmVsLCB7cHJlZm46ICdzdW1fJ30pXG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0IHVzZVJhd0RvbWFpbiA9IF91c2VSYXdEb21haW4oc2NhbGUsIG1vZGVsLCBjaGFubmVsKSxcbiAgc29ydCA9IGRvbWFpblNvcnQobW9kZWwsIGNoYW5uZWwsIHNjYWxlLnR5cGUpO1xuXG4gIGlmICh1c2VSYXdEb21haW4pIHsgLy8gdXNlUmF3RG9tYWluIC0gb25seSBRL1RcbiAgICByZXR1cm4ge1xuICAgICAgZGF0YTogU09VUkNFLFxuICAgICAgZmllbGQ6IG1vZGVsLmZpZWxkKGNoYW5uZWwsIHtub0FnZ3JlZ2F0ZTogdHJ1ZX0pXG4gICAgfTtcbiAgfSBlbHNlIGlmIChmaWVsZERlZi5iaW4pIHsgLy8gYmluXG4gICAgaWYgKHNjYWxlLnR5cGUgPT09IFNjYWxlVHlwZS5PUkRJTkFMKSB7XG4gICAgICAvLyBvcmRpbmFsIGJpbiBzY2FsZSB0YWtlcyBkb21haW4gZnJvbSBiaW5fcmFuZ2UsIG9yZGVyZWQgYnkgYmluX3N0YXJ0XG4gICAgICByZXR1cm4ge1xuICAgICAgICBkYXRhOiBtb2RlbC5kYXRhVGFibGUoKSxcbiAgICAgICAgZmllbGQ6IG1vZGVsLmZpZWxkKGNoYW5uZWwsIHsgYmluU3VmZml4OiAnX3JhbmdlJyB9KSxcbiAgICAgICAgc29ydDoge1xuICAgICAgICAgIGZpZWxkOiBtb2RlbC5maWVsZChjaGFubmVsLCB7IGJpblN1ZmZpeDogJ19zdGFydCcgfSksXG4gICAgICAgICAgb3A6ICdtaW4nIC8vIG1pbiBvciBtYXggZG9lc24ndCBtYXR0ZXIgc2luY2Ugc2FtZSBfcmFuZ2Ugd291bGQgaGF2ZSB0aGUgc2FtZSBfc3RhcnRcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKGNoYW5uZWwgPT09IENPTE9SKSB7XG4gICAgICAvLyBDdXJyZW50bHksIGJpbm5lZCBvbiBjb2xvciB1c2VzIGxpbmVhciBzY2FsZSBhbmQgdGh1cyB1c2UgX3N0YXJ0IHBvaW50XG4gICAgICByZXR1cm4ge1xuICAgICAgICBkYXRhOiBtb2RlbC5kYXRhVGFibGUoKSxcbiAgICAgICAgZmllbGQ6IG1vZGVsLmZpZWxkKGNoYW5uZWwsIHsgYmluU3VmZml4OiAnX3N0YXJ0JyB9KVxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gb3RoZXIgbGluZWFyIGJpbiBzY2FsZSBtZXJnZXMgYm90aCBiaW5fc3RhcnQgYW5kIGJpbl9lbmQgZm9yIG5vbi1vcmRpbmFsIHNjYWxlXG4gICAgICByZXR1cm4ge1xuICAgICAgICBkYXRhOiBtb2RlbC5kYXRhVGFibGUoKSxcbiAgICAgICAgZmllbGQ6IFtcbiAgICAgICAgICBtb2RlbC5maWVsZChjaGFubmVsLCB7IGJpblN1ZmZpeDogJ19zdGFydCcgfSksXG4gICAgICAgICAgbW9kZWwuZmllbGQoY2hhbm5lbCwgeyBiaW5TdWZmaXg6ICdfZW5kJyB9KVxuICAgICAgICBdXG4gICAgICB9O1xuICAgIH1cbiAgfSBlbHNlIGlmIChzb3J0KSB7IC8vIGhhdmUgc29ydCAtLSBvbmx5IGZvciBvcmRpbmFsXG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIElmIHNvcnQgYnkgYWdncmVnYXRpb24gb2YgYSBzcGVjaWZpZWQgc29ydCBmaWVsZCwgd2UgbmVlZCB0byB1c2UgU09VUkNFIHRhYmxlLFxuICAgICAgLy8gc28gd2UgY2FuIGFnZ3JlZ2F0ZSB2YWx1ZXMgZm9yIHRoZSBzY2FsZSBpbmRlcGVuZGVudGx5IGZyb20gdGhlIG1haW4gYWdncmVnYXRpb24uXG4gICAgICBkYXRhOiBzb3J0Lm9wID8gU09VUkNFIDogbW9kZWwuZGF0YVRhYmxlKCksXG4gICAgICBmaWVsZDogKGZpZWxkRGVmLnR5cGUgPT09IE9SRElOQUwgJiYgY2hhbm5lbCA9PT0gQ09MT1IpID8gbW9kZWwuZmllbGQoY2hhbm5lbCwge3ByZWZuOiAncmFua18nfSkgOiBtb2RlbC5maWVsZChjaGFubmVsKSxcbiAgICAgIHNvcnQ6IHNvcnRcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB7XG4gICAgICBkYXRhOiBtb2RlbC5kYXRhVGFibGUoKSxcbiAgICAgIGZpZWxkOiAoZmllbGREZWYudHlwZSA9PT0gT1JESU5BTCAmJiBjaGFubmVsID09PSBDT0xPUikgPyBtb2RlbC5maWVsZChjaGFubmVsLCB7cHJlZm46ICdyYW5rXyd9KSA6IG1vZGVsLmZpZWxkKGNoYW5uZWwpLFxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRvbWFpblNvcnQobW9kZWw6IE1vZGVsLCBjaGFubmVsOiBDaGFubmVsLCBzY2FsZVR5cGU6IFNjYWxlVHlwZSk6IGFueSB7XG4gIGlmIChzY2FsZVR5cGUgIT09IFNjYWxlVHlwZS5PUkRJTkFMKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIGNvbnN0IHNvcnQgPSBtb2RlbC5zb3J0KGNoYW5uZWwpO1xuICBpZiAoY29udGFpbnMoWydhc2NlbmRpbmcnLCAnZGVzY2VuZGluZycsIHVuZGVmaW5lZCAvKiBkZWZhdWx0ID1hc2NlbmRpbmcqL10sIHNvcnQpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBTb3J0ZWQgYmFzZWQgb24gYW4gYWdncmVnYXRlIGNhbGN1bGF0aW9uIG92ZXIgYSBzcGVjaWZpZWQgc29ydCBmaWVsZCAob25seSBmb3Igb3JkaW5hbCBzY2FsZSlcbiAgaWYgKHR5cGVvZiBzb3J0ICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB7XG4gICAgICBvcDogc29ydC5vcCxcbiAgICAgIGZpZWxkOiBzb3J0LmZpZWxkXG4gICAgfTtcbiAgfVxuXG4gIC8vIHNvcnQgPT09ICdub25lJ1xuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIHVzZVJhd0RvbWFpbiBzaG91bGQgYmUgYWN0aXZhdGVkIGZvciB0aGlzIHNjYWxlLlxuICogQHJldHVybiB7Qm9vbGVhbn0gUmV0dXJucyB0cnVlIGlmIGFsbCBvZiB0aGUgZm9sbG93aW5nIGNvbmRpdG9ucyBhcHBsaWVzOlxuICogMS4gYHVzZVJhd0RvbWFpbmAgaXMgZW5hYmxlZCBlaXRoZXIgdGhyb3VnaCBzY2FsZSBvciBjb25maWdcbiAqIDIuIEFnZ3JlZ2F0aW9uIGZ1bmN0aW9uIGlzIG5vdCBgY291bnRgIG9yIGBzdW1gXG4gKiAzLiBUaGUgc2NhbGUgaXMgcXVhbnRpdGF0aXZlIG9yIHRpbWUgc2NhbGUuXG4gKi9cbmZ1bmN0aW9uIF91c2VSYXdEb21haW4gKHNjYWxlOiBTY2FsZSwgbW9kZWw6IE1vZGVsLCBjaGFubmVsOiBDaGFubmVsKSB7XG4gIGNvbnN0IGZpZWxkRGVmID0gbW9kZWwuZmllbGREZWYoY2hhbm5lbCk7XG5cbiAgcmV0dXJuIHNjYWxlLnVzZVJhd0RvbWFpbiAmJiAvLyAgaWYgdXNlUmF3RG9tYWluIGlzIGVuYWJsZWRcbiAgICAvLyBvbmx5IGFwcGxpZWQgdG8gYWdncmVnYXRlIHRhYmxlXG4gICAgZmllbGREZWYuYWdncmVnYXRlICYmXG4gICAgLy8gb25seSBhY3RpdmF0ZWQgaWYgdXNlZCB3aXRoIGFnZ3JlZ2F0ZSBmdW5jdGlvbnMgdGhhdCBwcm9kdWNlcyB2YWx1ZXMgcmFuZ2luZyBpbiB0aGUgZG9tYWluIG9mIHRoZSBzb3VyY2UgZGF0YVxuICAgIFNIQVJFRF9ET01BSU5fT1BTLmluZGV4T2YoZmllbGREZWYuYWdncmVnYXRlKSA+PSAwICYmXG4gICAgKFxuICAgICAgLy8gUSBhbHdheXMgdXNlcyBxdWFudGl0YXRpdmUgc2NhbGUgZXhjZXB0IHdoZW4gaXQncyBiaW5uZWQuXG4gICAgICAvLyBCaW5uZWQgZmllbGQgaGFzIHNpbWlsYXIgdmFsdWVzIGluIGJvdGggdGhlIHNvdXJjZSB0YWJsZSBhbmQgdGhlIHN1bW1hcnkgdGFibGVcbiAgICAgIC8vIGJ1dCB0aGUgc3VtbWFyeSB0YWJsZSBoYXMgZmV3ZXIgdmFsdWVzLCB0aGVyZWZvcmUgYmlubmVkIGZpZWxkcyBkcmF3XG4gICAgICAvLyBkb21haW4gdmFsdWVzIGZyb20gdGhlIHN1bW1hcnkgdGFibGUuXG4gICAgICAoZmllbGREZWYudHlwZSA9PT0gUVVBTlRJVEFUSVZFICYmICFmaWVsZERlZi5iaW4pIHx8XG4gICAgICAvLyBUIHVzZXMgbm9uLW9yZGluYWwgc2NhbGUgd2hlbiB0aGVyZSdzIG5vIHVuaXQgb3Igd2hlbiB0aGUgdW5pdCBpcyBub3Qgb3JkaW5hbC5cbiAgICAgIChmaWVsZERlZi50eXBlID09PSBURU1QT1JBTCAmJiBjb250YWlucyhbU2NhbGVUeXBlLlRJTUUsIFNjYWxlVHlwZS5VVENdLCBzY2FsZS50eXBlKSlcbiAgICApO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiByYW5nZU1peGlucyhzY2FsZTogU2NhbGUsIG1vZGVsOiBNb2RlbCwgY2hhbm5lbDogQ2hhbm5lbCk6IGFueSB7XG4gIC8vIFRPRE86IG5lZWQgdG8gYWRkIHJ1bGUgZm9yIHF1YW50aWxlLCBxdWFudGl6ZSwgdGhyZXNob2xkIHNjYWxlXG5cbiAgY29uc3QgZmllbGREZWYgPSBtb2RlbC5maWVsZERlZihjaGFubmVsKTtcbiAgY29uc3Qgc2NhbGVDb25maWcgPSBtb2RlbC5jb25maWcoKS5zY2FsZTtcblxuICBpZiAoc2NhbGUudHlwZSA9PT0gU2NhbGVUeXBlLk9SRElOQUwgJiYgc2NhbGUuYmFuZFNpemUgJiYgY29udGFpbnMoW1gsIFldLCBjaGFubmVsKSkge1xuICAgIHJldHVybiB7YmFuZFNpemU6IHNjYWxlLmJhbmRTaXplfTtcbiAgfVxuXG4gIGlmIChzY2FsZS5yYW5nZSAmJiAhY29udGFpbnMoW1gsIFksIFJPVywgQ09MVU1OXSwgY2hhbm5lbCkpIHtcbiAgICAvLyBleHBsaWNpdCB2YWx1ZSAoRG8gbm90IGFsbG93IGV4cGxpY2l0IHZhbHVlcyBmb3IgWCwgWSwgUk9XLCBDT0xVTU4pXG4gICAgcmV0dXJuIHtyYW5nZTogc2NhbGUucmFuZ2V9O1xuICB9XG4gIHN3aXRjaCAoY2hhbm5lbCkge1xuICAgIGNhc2UgUk9XOlxuICAgICAgcmV0dXJuIHtyYW5nZTogJ2hlaWdodCd9O1xuICAgIGNhc2UgQ09MVU1OOlxuICAgICAgcmV0dXJuIHtyYW5nZTogJ3dpZHRoJ307XG4gIH1cblxuICAvLyBJZiBub3QgUk9XIC8gQ09MVU1OLCB3ZSBjYW4gYXNzdW1lIHRoYXQgdGhpcyBpcyBhIHVuaXQgc3BlYy5cbiAgY29uc3QgdW5pdE1vZGVsID0gbW9kZWwgYXMgVW5pdE1vZGVsO1xuICBzd2l0Y2ggKGNoYW5uZWwpIHtcbiAgICBjYXNlIFg6XG4gICAgICAvLyB3ZSBjYW4ndCB1c2Uge3JhbmdlOiBcIndpZHRoXCJ9IGhlcmUgc2luY2Ugd2UgcHV0IHNjYWxlIGluIHRoZSByb290IGdyb3VwXG4gICAgICAvLyBub3QgaW5zaWRlIHRoZSBjZWxsLCBzbyBzY2FsZSBpcyByZXVzYWJsZSBmb3IgYXhlcyBncm91cFxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICByYW5nZU1pbjogMCxcbiAgICAgICAgcmFuZ2VNYXg6IHVuaXRNb2RlbC5jb25maWcoKS5jZWxsLndpZHRoIC8vIEZpeGVkIGNlbGwgd2lkdGggZm9yIG5vbi1vcmRpbmFsXG4gICAgICB9O1xuICAgIGNhc2UgWTpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJhbmdlTWluOiB1bml0TW9kZWwuY29uZmlnKCkuY2VsbC5oZWlnaHQsIC8vIEZpeGVkIGNlbGwgaGVpZ2h0IGZvciBub24tb3JkaW5hbFxuICAgICAgICByYW5nZU1heDogMFxuICAgICAgfTtcbiAgICBjYXNlIFNJWkU6XG5cbiAgICAgIGlmICh1bml0TW9kZWwubWFyaygpID09PSBCQVIpIHtcbiAgICAgICAgaWYgKHNjYWxlQ29uZmlnLmJhclNpemVSYW5nZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgcmV0dXJuIHtyYW5nZTogc2NhbGVDb25maWcuYmFyU2l6ZVJhbmdlfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkaW1lbnNpb24gPSBtb2RlbC5jb25maWcoKS5tYXJrLm9yaWVudCA9PT0gJ2hvcml6b250YWwnID8gWSA6IFg7XG4gICAgICAgIHJldHVybiB7cmFuZ2U6IFttb2RlbC5jb25maWcoKS5tYXJrLmJhclRoaW5TaXplLCBtb2RlbC5zY2FsZShkaW1lbnNpb24pLmJhbmRTaXplXX07XG4gICAgICB9IGVsc2UgaWYgKHVuaXRNb2RlbC5tYXJrKCkgPT09IFRFWFRfTUFSSykge1xuICAgICAgICByZXR1cm4ge3JhbmdlOiBzY2FsZUNvbmZpZy5mb250U2l6ZVJhbmdlIH07XG4gICAgICB9IGVsc2UgaWYgKHVuaXRNb2RlbC5tYXJrKCkgPT09IFJVTEUpIHtcbiAgICAgICAgcmV0dXJuIHtyYW5nZTogc2NhbGVDb25maWcucnVsZVNpemVSYW5nZSB9O1xuICAgICAgfSBlbHNlIGlmICh1bml0TW9kZWwubWFyaygpID09PSBUSUNLKSB7XG4gICAgICAgIHJldHVybiB7cmFuZ2U6IHNjYWxlQ29uZmlnLnRpY2tTaXplUmFuZ2UgfTtcbiAgICAgIH1cbiAgICAgIC8vIGVsc2UgLS0gcG9pbnQsIHNxdWFyZSwgY2lyY2xlXG4gICAgICBpZiAoc2NhbGVDb25maWcucG9pbnRTaXplUmFuZ2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4ge3JhbmdlOiBzY2FsZUNvbmZpZy5wb2ludFNpemVSYW5nZX07XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGJhbmRTaXplID0gcG9pbnRCYW5kU2l6ZSh1bml0TW9kZWwpO1xuXG4gICAgICByZXR1cm4ge3JhbmdlOiBbOSwgKGJhbmRTaXplIC0gMikgKiAoYmFuZFNpemUgLSAyKV19O1xuICAgIGNhc2UgU0hBUEU6XG4gICAgICByZXR1cm4ge3JhbmdlOiBzY2FsZUNvbmZpZy5zaGFwZVJhbmdlfTtcbiAgICBjYXNlIENPTE9SOlxuICAgICAgaWYgKGZpZWxkRGVmLnR5cGUgPT09IE5PTUlOQUwpIHtcbiAgICAgICAgcmV0dXJuIHtyYW5nZTogc2NhbGVDb25maWcubm9taW5hbENvbG9yUmFuZ2V9O1xuICAgICAgfVxuICAgICAgLy8gZWxzZSAtLSBvcmRpbmFsLCB0aW1lLCBvciBxdWFudGl0YXRpdmVcbiAgICAgIHJldHVybiB7cmFuZ2U6IHNjYWxlQ29uZmlnLnNlcXVlbnRpYWxDb2xvclJhbmdlfTtcbiAgICBjYXNlIE9QQUNJVFk6XG4gICAgICByZXR1cm4ge3JhbmdlOiBzY2FsZUNvbmZpZy5vcGFjaXR5fTtcbiAgfVxuICByZXR1cm4ge307XG59XG5cbmZ1bmN0aW9uIHBvaW50QmFuZFNpemUobW9kZWw6IFVuaXRNb2RlbCkge1xuICBjb25zdCBzY2FsZUNvbmZpZyA9IG1vZGVsLmNvbmZpZygpLnNjYWxlO1xuXG4gIGNvbnN0IGhhc1ggPSBtb2RlbC5oYXMoWCk7XG4gIGNvbnN0IGhhc1kgPSBtb2RlbC5oYXMoWSk7XG5cbiAgY29uc3QgeElzTWVhc3VyZSA9IGlzTWVhc3VyZShtb2RlbC5lbmNvZGluZygpLngpO1xuICBjb25zdCB5SXNNZWFzdXJlID0gaXNNZWFzdXJlKG1vZGVsLmVuY29kaW5nKCkueSk7XG5cbiAgaWYgKGhhc1ggJiYgaGFzWSkge1xuICAgIHJldHVybiB4SXNNZWFzdXJlICE9PSB5SXNNZWFzdXJlID9cbiAgICAgIG1vZGVsLnNjYWxlKHhJc01lYXN1cmUgPyBZIDogWCkuYmFuZFNpemUgOlxuICAgICAgTWF0aC5taW4oXG4gICAgICAgIG1vZGVsLnNjYWxlKFgpLmJhbmRTaXplIHx8IHNjYWxlQ29uZmlnLmJhbmRTaXplLFxuICAgICAgICBtb2RlbC5zY2FsZShZKS5iYW5kU2l6ZSB8fCBzY2FsZUNvbmZpZy5iYW5kU2l6ZVxuICAgICAgKTtcbiAgfSBlbHNlIGlmIChoYXNZKSB7XG4gICAgcmV0dXJuIHlJc01lYXN1cmUgPyBtb2RlbC5jb25maWcoKS5zY2FsZS5iYW5kU2l6ZSA6IG1vZGVsLnNjYWxlKFkpLmJhbmRTaXplO1xuICB9IGVsc2UgaWYgKGhhc1gpIHtcbiAgICByZXR1cm4geElzTWVhc3VyZSA/IG1vZGVsLmNvbmZpZygpLnNjYWxlLmJhbmRTaXplIDogbW9kZWwuc2NhbGUoWCkuYmFuZFNpemU7XG4gIH1cbiAgcmV0dXJuIG1vZGVsLmNvbmZpZygpLnNjYWxlLmJhbmRTaXplO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xhbXAoc2NhbGU6IFNjYWxlKSB7XG4gIC8vIE9ubHkgd29ya3MgZm9yIHNjYWxlIHdpdGggYm90aCBjb250aW51b3VzIGRvbWFpbiBjb250aW51b3VzIHJhbmdlXG4gIC8vIChEb2Vzbid0IHdvcmsgZm9yIHF1YW50aXplLCBxdWFudGlsZSwgdGhyZXNob2xkLCBvcmRpbmFsKVxuICBpZiAoY29udGFpbnMoW1NjYWxlVHlwZS5MSU5FQVIsIFNjYWxlVHlwZS5QT1csIFNjYWxlVHlwZS5TUVJULFxuICAgICAgICBTY2FsZVR5cGUuTE9HLCBTY2FsZVR5cGUuVElNRSwgU2NhbGVUeXBlLlVUQ10sIHNjYWxlLnR5cGUpKSB7XG4gICAgcmV0dXJuIHNjYWxlLmNsYW1wO1xuICB9XG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleHBvbmVudChzY2FsZTogU2NhbGUpIHtcbiAgaWYgKHNjYWxlLnR5cGUgPT09IFNjYWxlVHlwZS5QT1cpIHtcbiAgICByZXR1cm4gc2NhbGUuZXhwb25lbnQ7XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5pY2Uoc2NhbGU6IFNjYWxlLCBjaGFubmVsOiBDaGFubmVsLCBmaWVsZERlZjogRmllbGREZWYpOiBib29sZWFuIHwgTmljZVRpbWUge1xuICBpZiAoY29udGFpbnMoW1NjYWxlVHlwZS5MSU5FQVIsIFNjYWxlVHlwZS5QT1csIFNjYWxlVHlwZS5TUVJULCBTY2FsZVR5cGUuTE9HLFxuICAgICAgICBTY2FsZVR5cGUuVElNRSwgU2NhbGVUeXBlLlVUQywgU2NhbGVUeXBlLlFVQU5USVpFXSwgc2NhbGUudHlwZSkpIHtcblxuICAgIGlmIChzY2FsZS5uaWNlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBzY2FsZS5uaWNlO1xuICAgIH1cbiAgICBpZiAoY29udGFpbnMoW1NjYWxlVHlwZS5USU1FLCBTY2FsZVR5cGUuVVRDXSwgc2NhbGUudHlwZSkpIHtcbiAgICAgIHJldHVybiBzbWFsbGVzdFVuaXQoZmllbGREZWYudGltZVVuaXQpIGFzIGFueTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbnRhaW5zKFtYLCBZXSwgY2hhbm5lbCk7IC8vIHJldHVybiB0cnVlIGZvciBxdWFudGl0YXRpdmUgWC9ZXG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gcGFkZGluZyhzY2FsZTogU2NhbGUsIGNoYW5uZWw6IENoYW5uZWwpIHtcbiAgLyogUGFkZGluZyBpcyBvbmx5IGFsbG93ZWQgZm9yIFggYW5kIFkuXG4gICAqXG4gICAqIEJhc2ljYWxseSBpdCBkb2Vzbid0IG1ha2Ugc2Vuc2UgdG8gYWRkIHBhZGRpbmcgZm9yIGNvbG9yIGFuZCBzaXplLlxuICAgKlxuICAgKiBXZSBkbyBub3QgdXNlIGQzIHNjYWxlJ3MgcGFkZGluZyBmb3Igcm93L2NvbHVtbiBiZWNhdXNlIHBhZGRpbmcgdGhlcmVcbiAgICogaXMgYSByYXRpbyAoWzAsIDFdKSBhbmQgaXQgY2F1c2VzIHRoZSBwYWRkaW5nIHRvIGJlIGRlY2ltYWxzLlxuICAgKiBUaGVyZWZvcmUsIHdlIG1hbnVhbGx5IGNhbGN1bGF0ZSBwYWRkaW5nIGluIHRoZSBsYXlvdXQgYnkgb3Vyc2VsdmVzLlxuICAgKi9cbiAgaWYgKHNjYWxlLnR5cGUgPT09IFNjYWxlVHlwZS5PUkRJTkFMICYmIGNvbnRhaW5zKFtYLCBZXSwgY2hhbm5lbCkpIHtcbiAgICByZXR1cm4gc2NhbGUucGFkZGluZztcbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcG9pbnRzKHNjYWxlOiBTY2FsZSwgY2hhbm5lbDogQ2hhbm5lbCwgX18sIG1vZGVsOiBNb2RlbCkge1xuICBpZiAoc2NhbGUudHlwZSA9PT0gU2NhbGVUeXBlLk9SRElOQUwgJiYgY29udGFpbnMoW1gsIFldLCBjaGFubmVsKSkge1xuICAgIC8vIFdlIGFsd2F5cyB1c2Ugb3JkaW5hbCBwb2ludCBzY2FsZSBmb3IgeCBhbmQgeS5cbiAgICAvLyBUaHVzIGBwb2ludHNgIGlzbid0IGluY2x1ZGVkIGluIHRoZSBzY2FsZSdzIHNjaGVtYS5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcm91bmQoc2NhbGU6IFNjYWxlLCBjaGFubmVsOiBDaGFubmVsKSB7XG4gIGlmIChjb250YWlucyhbWCwgWSwgUk9XLCBDT0xVTU4sIFNJWkVdLCBjaGFubmVsKSAmJiBzY2FsZS5yb3VuZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIHNjYWxlLnJvdW5kO1xuICB9XG5cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHplcm8oc2NhbGU6IFNjYWxlLCBjaGFubmVsOiBDaGFubmVsLCBmaWVsZERlZjogRmllbGREZWYpIHtcbiAgLy8gb25seSBhcHBsaWNhYmxlIGZvciBub24tb3JkaW5hbCBzY2FsZVxuICBpZiAoIWNvbnRhaW5zKFtTY2FsZVR5cGUuVElNRSwgU2NhbGVUeXBlLlVUQywgU2NhbGVUeXBlLk9SRElOQUxdLCBzY2FsZS50eXBlKSkge1xuICAgIGlmIChzY2FsZS56ZXJvICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBzY2FsZS56ZXJvO1xuICAgIH1cbiAgICAvLyBCeSBkZWZhdWx0LCByZXR1cm4gdHJ1ZSBvbmx5IGZvciBub24tYmlubmVkLCBxdWFudGl0YXRpdmUgeC1zY2FsZSBvciB5LXNjYWxlLlxuICAgIHJldHVybiAhZmllbGREZWYuYmluICYmIGNvbnRhaW5zKFtYLCBZXSwgY2hhbm5lbCk7XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cbiIsImltcG9ydCB7RW5jb2Rpbmd9IGZyb20gJy4uL2VuY29kaW5nJztcbmltcG9ydCB7Q29uZmlnfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHtGaWVsZERlZn0gZnJvbSAnLi4vZmllbGRkZWYnO1xuaW1wb3J0IHtDaGFubmVsLCBYLCBZLCBDT0xPUiwgREVUQUlMLCBPUkRFUiwgT1BBQ0lUWSwgU0laRX0gZnJvbSAnLi4vY2hhbm5lbCc7XG5pbXBvcnQge1NjYWxlLCBTY2FsZVR5cGV9IGZyb20gJy4uL3NjYWxlJztcbmltcG9ydCB7U3RhY2tPZmZzZXR9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQge0JBUiwgQVJFQSwgTWFya30gZnJvbSAnLi4vbWFyayc7XG5pbXBvcnQge2ZpZWxkLCBpc01lYXN1cmV9IGZyb20gJy4uL2ZpZWxkZGVmJztcbmltcG9ydCB7aGFzLCBpc0FnZ3JlZ2F0ZSwgaXNSYW5nZWR9IGZyb20gJy4uL2VuY29kaW5nJztcbmltcG9ydCB7aXNBcnJheSwgY29udGFpbnMsIERpY3R9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQge3NvcnRGaWVsZH0gZnJvbSAnLi9jb21tb24nO1xuaW1wb3J0IHtNb2RlbH0gZnJvbSAnLi9tb2RlbCc7XG5pbXBvcnQge1VuaXRNb2RlbH0gZnJvbSAnLi91bml0JztcblxuXG5leHBvcnQgaW50ZXJmYWNlIFN0YWNrUHJvcGVydGllcyB7XG4gIC8qKiBEaW1lbnNpb24gYXhpcyBvZiB0aGUgc3RhY2sgKCd4JyBvciAneScpLiAqL1xuICBncm91cGJ5Q2hhbm5lbDogQ2hhbm5lbDtcbiAgLyoqIE1lYXN1cmUgYXhpcyBvZiB0aGUgc3RhY2sgKCd4JyBvciAneScpLiAqL1xuICBmaWVsZENoYW5uZWw6IENoYW5uZWw7XG5cbiAgLyoqIFN0YWNrLWJ5IGZpZWxkIG5hbWVzIChmcm9tICdjb2xvcicgYW5kICdkZXRhaWwnKSAqL1xuICBzdGFja0ZpZWxkczogc3RyaW5nW107XG5cbiAgLyoqIFN0YWNrIG9mZnNldCBwcm9wZXJ0eS4gKi9cbiAgb2Zmc2V0OiBTdGFja09mZnNldDtcbn1cblxuLy8gVE9ETzogcHV0IGFsbCB2ZWdhIGludGVyZmFjZSBpbiBvbmUgcGxhY2VcbmV4cG9ydCBpbnRlcmZhY2UgU3RhY2tUcmFuc2Zvcm0ge1xuICB0eXBlOiBzdHJpbmc7XG4gIG9mZnNldD86IGFueTtcbiAgZ3JvdXBieTogYW55O1xuICBmaWVsZDogYW55O1xuICBzb3J0Ynk6IGFueTtcbiAgb3V0cHV0OiBhbnk7XG59XG5cbi8qKiBDb21waWxlIHN0YWNrIHByb3BlcnRpZXMgZnJvbSBhIGdpdmVuIHNwZWMgKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlU3RhY2tQcm9wZXJ0aWVzKG1hcms6IE1hcmssIGVuY29kaW5nOiBFbmNvZGluZywgc2NhbGU6IERpY3Q8U2NhbGU+LCBjb25maWc6IENvbmZpZykge1xuICBjb25zdCBzdGFja0ZpZWxkcyA9IGdldFN0YWNrRmllbGRzKG1hcmssIGVuY29kaW5nLCBzY2FsZSk7XG5cbiAgaWYgKHN0YWNrRmllbGRzLmxlbmd0aCA+IDAgJiZcbiAgICAgIGNvbnRhaW5zKFtCQVIsIEFSRUFdLCBtYXJrKSAmJlxuICAgICAgY29uZmlnLm1hcmsuc3RhY2tlZCAhPT0gU3RhY2tPZmZzZXQuTk9ORSAmJlxuICAgICAgaXNBZ2dyZWdhdGUoZW5jb2RpbmcpICYmICFpc1JhbmdlZChlbmNvZGluZykpIHtcblxuICAgIGNvbnN0IGlzWE1lYXN1cmUgPSBoYXMoZW5jb2RpbmcsIFgpICYmIGlzTWVhc3VyZShlbmNvZGluZy54KSxcbiAgICBpc1lNZWFzdXJlID0gaGFzKGVuY29kaW5nLCBZKSAmJiBpc01lYXN1cmUoZW5jb2RpbmcueSk7XG5cbiAgICBpZiAoaXNYTWVhc3VyZSAmJiAhaXNZTWVhc3VyZSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZ3JvdXBieUNoYW5uZWw6IFksXG4gICAgICAgIGZpZWxkQ2hhbm5lbDogWCxcbiAgICAgICAgc3RhY2tGaWVsZHM6IHN0YWNrRmllbGRzLFxuICAgICAgICBvZmZzZXQ6IGNvbmZpZy5tYXJrLnN0YWNrZWRcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChpc1lNZWFzdXJlICYmICFpc1hNZWFzdXJlKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBncm91cGJ5Q2hhbm5lbDogWCxcbiAgICAgICAgZmllbGRDaGFubmVsOiBZLFxuICAgICAgICBzdGFja0ZpZWxkczogc3RhY2tGaWVsZHMsXG4gICAgICAgIG9mZnNldDogY29uZmlnLm1hcmsuc3RhY2tlZFxuICAgICAgfTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKiBDb21waWxlIHN0YWNrLWJ5IGZpZWxkIG5hbWVzIGZyb20gKGZyb20gJ2NvbG9yJyBhbmQgJ2RldGFpbCcpICovXG5mdW5jdGlvbiBnZXRTdGFja0ZpZWxkcyhtYXJrOiBNYXJrLCBlbmNvZGluZzogRW5jb2RpbmcsIHNjYWxlTWFwOiBEaWN0PFNjYWxlPikge1xuICByZXR1cm4gW0NPTE9SLCBERVRBSUwsIE9QQUNJVFksIFNJWkVdLnJlZHVjZShmdW5jdGlvbihmaWVsZHMsIGNoYW5uZWwpIHtcbiAgICBjb25zdCBjaGFubmVsRW5jb2RpbmcgPSBlbmNvZGluZ1tjaGFubmVsXTtcbiAgICBpZiAoaGFzKGVuY29kaW5nLCBjaGFubmVsKSkge1xuICAgICAgaWYgKGlzQXJyYXkoY2hhbm5lbEVuY29kaW5nKSkge1xuICAgICAgICBjaGFubmVsRW5jb2RpbmcuZm9yRWFjaChmdW5jdGlvbihmaWVsZERlZikge1xuICAgICAgICAgIGZpZWxkcy5wdXNoKGZpZWxkKGZpZWxkRGVmKSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZmllbGREZWY6IEZpZWxkRGVmID0gY2hhbm5lbEVuY29kaW5nO1xuICAgICAgICBjb25zdCBzY2FsZSA9IHNjYWxlTWFwW2NoYW5uZWxdO1xuICAgICAgICBmaWVsZHMucHVzaChmaWVsZChmaWVsZERlZiwge1xuICAgICAgICAgIGJpblN1ZmZpeDogc2NhbGUgJiYgc2NhbGUudHlwZSA9PT0gU2NhbGVUeXBlLk9SRElOQUwgPyAnX3JhbmdlJyA6ICdfc3RhcnQnXG4gICAgICAgIH0pKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZpZWxkcztcbiAgfSwgW10pO1xufVxuXG4vLyBpbXB1dGUgZGF0YSBmb3Igc3RhY2tlZCBhcmVhXG5leHBvcnQgZnVuY3Rpb24gaW1wdXRlVHJhbnNmb3JtKG1vZGVsOiBNb2RlbCkge1xuICBjb25zdCBzdGFjayA9IG1vZGVsLnN0YWNrKCk7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ2ltcHV0ZScsXG4gICAgZmllbGQ6IG1vZGVsLmZpZWxkKHN0YWNrLmZpZWxkQ2hhbm5lbCksXG4gICAgZ3JvdXBieTogc3RhY2suc3RhY2tGaWVsZHMsXG4gICAgb3JkZXJieTogW21vZGVsLmZpZWxkKHN0YWNrLmdyb3VwYnlDaGFubmVsKV0sXG4gICAgbWV0aG9kOiAndmFsdWUnLFxuICAgIHZhbHVlOiAwXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFja1RyYW5zZm9ybShtb2RlbDogVW5pdE1vZGVsKSB7XG4gIGNvbnN0IHN0YWNrID0gbW9kZWwuc3RhY2soKTtcbiAgY29uc3QgZW5jb2RpbmcgPSBtb2RlbC5lbmNvZGluZygpO1xuICBjb25zdCBzb3J0YnkgPSBtb2RlbC5oYXMoT1JERVIpID9cbiAgICAoaXNBcnJheShlbmNvZGluZ1tPUkRFUl0pID8gZW5jb2RpbmdbT1JERVJdIDogW2VuY29kaW5nW09SREVSXV0pLm1hcChzb3J0RmllbGQpIDpcbiAgICAvLyBkZWZhdWx0ID0gZGVzY2VuZGluZyBieSBzdGFja0ZpZWxkc1xuICAgIHN0YWNrLnN0YWNrRmllbGRzLm1hcChmdW5jdGlvbihmaWVsZCkge1xuICAgICByZXR1cm4gJy0nICsgZmllbGQ7XG4gICAgfSk7XG5cbiAgY29uc3QgdmFsTmFtZSA9IG1vZGVsLmZpZWxkKHN0YWNrLmZpZWxkQ2hhbm5lbCk7XG5cbiAgLy8gYWRkIHN0YWNrIHRyYW5zZm9ybSB0byBtYXJrXG4gIGxldCB0cmFuc2Zvcm06IFN0YWNrVHJhbnNmb3JtID0ge1xuICAgIHR5cGU6ICdzdGFjaycsXG4gICAgZ3JvdXBieTogW21vZGVsLmZpZWxkKHN0YWNrLmdyb3VwYnlDaGFubmVsKV0sXG4gICAgZmllbGQ6IG1vZGVsLmZpZWxkKHN0YWNrLmZpZWxkQ2hhbm5lbCksXG4gICAgc29ydGJ5OiBzb3J0YnksXG4gICAgb3V0cHV0OiB7XG4gICAgICBzdGFydDogdmFsTmFtZSArICdfc3RhcnQnLFxuICAgICAgZW5kOiB2YWxOYW1lICsgJ19lbmQnXG4gICAgfVxuICB9O1xuXG4gIGlmIChzdGFjay5vZmZzZXQpIHtcbiAgICB0cmFuc2Zvcm0ub2Zmc2V0ID0gc3RhY2sub2Zmc2V0O1xuICB9XG4gIHJldHVybiB0cmFuc2Zvcm07XG59XG4iLCJpbXBvcnQge2NvbnRhaW5zLCByYW5nZX0gZnJvbSAnLi4vdXRpbCc7XG5pbXBvcnQge0NPTFVNTiwgUk9XLCBTSEFQRSwgQ09MT1IsIENoYW5uZWx9IGZyb20gJy4uL2NoYW5uZWwnO1xuaW1wb3J0IHtUaW1lVW5pdH0gZnJvbSAnLi4vdGltZXVuaXQnO1xuXG4vKiogcmV0dXJucyB0aGUgc21hbGxlc3QgbmljZSB1bml0IGZvciBzY2FsZS5uaWNlICovXG5leHBvcnQgZnVuY3Rpb24gc21hbGxlc3RVbml0KHRpbWVVbml0KTogc3RyaW5nIHtcbiAgaWYgKCF0aW1lVW5pdCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBpZiAodGltZVVuaXQuaW5kZXhPZignc2Vjb25kJykgPiAtMSkge1xuICAgIHJldHVybiAnc2Vjb25kJztcbiAgfVxuXG4gIGlmICh0aW1lVW5pdC5pbmRleE9mKCdtaW51dGUnKSA+IC0xKSB7XG4gICAgcmV0dXJuICdtaW51dGUnO1xuICB9XG5cbiAgaWYgKHRpbWVVbml0LmluZGV4T2YoJ2hvdXInKSA+IC0xKSB7XG4gICAgcmV0dXJuICdob3VyJztcbiAgfVxuXG4gIGlmICh0aW1lVW5pdC5pbmRleE9mKCdkYXknKSA+IC0xIHx8IHRpbWVVbml0LmluZGV4T2YoJ2RhdGUnKSA+IC0xKSB7XG4gICAgcmV0dXJuICdkYXknO1xuICB9XG5cbiAgaWYgKHRpbWVVbml0LmluZGV4T2YoJ21vbnRoJykgPiAtMSkge1xuICAgIHJldHVybiAnbW9udGgnO1xuICB9XG5cbiAgaWYgKHRpbWVVbml0LmluZGV4T2YoJ3llYXInKSA+IC0xKSB7XG4gICAgcmV0dXJuICd5ZWFyJztcbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VFeHByZXNzaW9uKHRpbWVVbml0OiBUaW1lVW5pdCwgZmllbGRSZWY6IHN0cmluZywgb25seVJlZiA9IGZhbHNlKTogc3RyaW5nIHtcbiAgbGV0IG91dCA9ICdkYXRldGltZSgnO1xuICBsZXQgdGltZVN0cmluZyA9IHRpbWVVbml0LnRvU3RyaW5nKCk7XG5cbiAgZnVuY3Rpb24gZ2V0KGZ1bjogc3RyaW5nLCBhZGRDb21tYSA9IHRydWUpIHtcbiAgICBpZiAob25seVJlZikge1xuICAgICAgcmV0dXJuIGZpZWxkUmVmICsgKGFkZENvbW1hID8gJywgJyA6ICcnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZ1biArICcoJyArIGZpZWxkUmVmICsgJyknICsgKGFkZENvbW1hID8gJywgJyA6ICcnKTtcbiAgICB9XG4gIH1cblxuICBpZiAodGltZVN0cmluZy5pbmRleE9mKCd5ZWFyJykgPiAtMSkge1xuICAgIG91dCArPSBnZXQoJ3llYXInKTtcbiAgfSBlbHNlIHtcbiAgICBvdXQgKz0gJzIwMDYsICc7IC8vIEphbnVhcnkgMSAyMDA2IGlzIGEgU3VuZGF5XG4gIH1cblxuICBpZiAodGltZVN0cmluZy5pbmRleE9mKCdtb250aCcpID4gLTEpIHtcbiAgICBvdXQgKz0gZ2V0KCdtb250aCcpO1xuICB9IGVsc2Uge1xuICAgIC8vIG1vbnRoIHN0YXJ0cyBhdCAwIGluIGphdmFzY3JpcHRcbiAgICBvdXQgKz0gJzAsICc7XG4gIH1cblxuICAvLyBuZWVkIHRvIGFkZCAxIGJlY2F1c2UgZGF5cyBzdGFydCBhdCAxXG4gIGlmICh0aW1lU3RyaW5nLmluZGV4T2YoJ2RheScpID4gLTEpIHtcbiAgICBvdXQgKz0gZ2V0KCdkYXknLCBmYWxzZSkgKyAnKzEsICc7XG4gIH0gZWxzZSBpZiAodGltZVN0cmluZy5pbmRleE9mKCdkYXRlJykgPiAtMSkge1xuICAgIG91dCArPSBnZXQoJ2RhdGUnKTtcbiAgfSBlbHNlIHtcbiAgICBvdXQgKz0gJzEsICc7XG4gIH1cblxuICBpZiAodGltZVN0cmluZy5pbmRleE9mKCdob3VycycpID4gLTEpIHtcbiAgICBvdXQgKz0gZ2V0KCdob3VycycpO1xuICB9IGVsc2Uge1xuICAgIG91dCArPSAnMCwgJztcbiAgfVxuXG4gIGlmICh0aW1lU3RyaW5nLmluZGV4T2YoJ21pbnV0ZXMnKSA+IC0xKSB7XG4gICAgb3V0ICs9IGdldCgnbWludXRlcycpO1xuICB9IGVsc2Uge1xuICAgIG91dCArPSAnMCwgJztcbiAgfVxuXG4gIGlmICh0aW1lU3RyaW5nLmluZGV4T2YoJ3NlY29uZHMnKSA+IC0xKSB7XG4gICAgb3V0ICs9IGdldCgnc2Vjb25kcycpO1xuICB9IGVsc2Uge1xuICAgIG91dCArPSAnMCwgJztcbiAgfVxuXG4gIGlmICh0aW1lU3RyaW5nLmluZGV4T2YoJ21pbGxpc2Vjb25kcycpID4gLTEpIHtcbiAgICBvdXQgKz0gZ2V0KCdtaWxsaXNlY29uZHMnLCBmYWxzZSk7XG4gIH0gZWxzZSB7XG4gICAgb3V0ICs9ICcwJztcbiAgfVxuXG4gIHJldHVybiBvdXQgKyAnKSc7XG59XG5cbi8qKiBHZW5lcmF0ZSB0aGUgY29tcGxldGUgcmF3IGRvbWFpbi4gKi9cbmV4cG9ydCBmdW5jdGlvbiByYXdEb21haW4odGltZVVuaXQ6IFRpbWVVbml0LCBjaGFubmVsOiBDaGFubmVsKSB7XG4gIGlmIChjb250YWlucyhbUk9XLCBDT0xVTU4sIFNIQVBFLCBDT0xPUl0sIGNoYW5uZWwpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBzd2l0Y2ggKHRpbWVVbml0KSB7XG4gICAgY2FzZSBUaW1lVW5pdC5TRUNPTkRTOlxuICAgICAgcmV0dXJuIHJhbmdlKDAsIDYwKTtcbiAgICBjYXNlIFRpbWVVbml0Lk1JTlVURVM6XG4gICAgICByZXR1cm4gcmFuZ2UoMCwgNjApO1xuICAgIGNhc2UgVGltZVVuaXQuSE9VUlM6XG4gICAgICByZXR1cm4gcmFuZ2UoMCwgMjQpO1xuICAgIGNhc2UgVGltZVVuaXQuREFZOlxuICAgICAgcmV0dXJuIHJhbmdlKDAsIDcpO1xuICAgIGNhc2UgVGltZVVuaXQuREFURTpcbiAgICAgIHJldHVybiByYW5nZSgxLCAzMik7XG4gICAgY2FzZSBUaW1lVW5pdC5NT05USDpcbiAgICAgIHJldHVybiByYW5nZSgwLCAxMik7XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cbiIsImltcG9ydCB7QWdncmVnYXRlT3B9IGZyb20gJy4uL2FnZ3JlZ2F0ZSc7XG5pbXBvcnQge0F4aXN9IGZyb20gJy4uL2F4aXMnO1xuaW1wb3J0IHtYLCBZLCBYMiwgWTIsIFRFWFQsIFBBVEgsIE9SREVSLCBDaGFubmVsLCBVTklUX0NIQU5ORUxTLCAgVU5JVF9TQ0FMRV9DSEFOTkVMUywgTk9OU1BBVElBTF9TQ0FMRV9DSEFOTkVMUywgc3VwcG9ydE1hcmt9IGZyb20gJy4uL2NoYW5uZWwnO1xuaW1wb3J0IHtkZWZhdWx0Q29uZmlnLCBDb25maWcsIENlbGxDb25maWd9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQge1NPVVJDRSwgU1VNTUFSWX0gZnJvbSAnLi4vZGF0YSc7XG5pbXBvcnQge0VuY29kaW5nfSBmcm9tICcuLi9lbmNvZGluZyc7XG5pbXBvcnQgKiBhcyB2bEVuY29kaW5nIGZyb20gJy4uL2VuY29kaW5nJzsgLy8gVE9ETzogcmVtb3ZlXG5pbXBvcnQge0ZpZWxkRGVmLCBGaWVsZFJlZk9wdGlvbiwgZmllbGR9IGZyb20gJy4uL2ZpZWxkZGVmJztcbmltcG9ydCB7TGVnZW5kfSBmcm9tICcuLi9sZWdlbmQnO1xuaW1wb3J0IHtNYXJrLCBURVhUIGFzIFRFWFRNQVJLfSBmcm9tICcuLi9tYXJrJztcbmltcG9ydCB7U2NhbGUsIFNjYWxlVHlwZX0gZnJvbSAnLi4vc2NhbGUnO1xuaW1wb3J0IHtFeHRlbmRlZFVuaXRTcGVjfSBmcm9tICcuLi9zcGVjJztcbmltcG9ydCB7Z2V0RnVsbE5hbWUsIFFVQU5USVRBVElWRX0gZnJvbSAnLi4vdHlwZSc7XG5pbXBvcnQge2R1cGxpY2F0ZSwgZXh0ZW5kLCBtZXJnZURlZXAsIERpY3R9IGZyb20gJy4uL3V0aWwnO1xuaW1wb3J0IHtWZ0RhdGF9IGZyb20gJy4uL3ZlZ2Euc2NoZW1hJztcblxuaW1wb3J0IHtwYXJzZUF4aXNDb21wb25lbnR9IGZyb20gJy4vYXhpcyc7XG5pbXBvcnQge2FwcGx5Q29uZmlnLCBGSUxMX1NUUk9LRV9DT05GSUd9IGZyb20gJy4vY29tbW9uJztcbmltcG9ydCB7aW5pdE1hcmtDb25maWd9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7YXNzZW1ibGVEYXRhLCBwYXJzZVVuaXREYXRhfSBmcm9tICcuL2RhdGEvZGF0YSc7XG5pbXBvcnQge3BhcnNlTGVnZW5kQ29tcG9uZW50fSBmcm9tICcuL2xlZ2VuZCc7XG5pbXBvcnQge2Fzc2VtYmxlTGF5b3V0LCBwYXJzZVVuaXRMYXlvdXR9IGZyb20gJy4vbGF5b3V0JztcbmltcG9ydCB7TW9kZWx9IGZyb20gJy4vbW9kZWwnO1xuaW1wb3J0IHtwYXJzZU1hcmt9IGZyb20gJy4vbWFyay9tYXJrJztcbmltcG9ydCB7cGFyc2VTY2FsZUNvbXBvbmVudCwgc2NhbGVUeXBlfSBmcm9tICcuL3NjYWxlJztcbmltcG9ydCB7Y29tcGlsZVN0YWNrUHJvcGVydGllcywgU3RhY2tQcm9wZXJ0aWVzfSBmcm9tICcuL3N0YWNrJztcblxuLyoqXG4gKiBJbnRlcm5hbCBtb2RlbCBvZiBWZWdhLUxpdGUgc3BlY2lmaWNhdGlvbiBmb3IgdGhlIGNvbXBpbGVyLlxuICovXG5leHBvcnQgY2xhc3MgVW5pdE1vZGVsIGV4dGVuZHMgTW9kZWwge1xuXG4gIHByaXZhdGUgX21hcms6IE1hcms7XG4gIHByaXZhdGUgX2VuY29kaW5nOiBFbmNvZGluZztcbiAgcHJpdmF0ZSBfc3RhY2s6IFN0YWNrUHJvcGVydGllcztcblxuICBjb25zdHJ1Y3RvcihzcGVjOiBFeHRlbmRlZFVuaXRTcGVjLCBwYXJlbnQ6IE1vZGVsLCBwYXJlbnRHaXZlbk5hbWU6IHN0cmluZykge1xuICAgIHN1cGVyKHNwZWMsIHBhcmVudCwgcGFyZW50R2l2ZW5OYW1lKTtcblxuICAgIGNvbnN0IG1hcmsgPSB0aGlzLl9tYXJrID0gc3BlYy5tYXJrO1xuICAgIGNvbnN0IGVuY29kaW5nID0gdGhpcy5fZW5jb2RpbmcgPSB0aGlzLl9pbml0RW5jb2RpbmcobWFyaywgc3BlYy5lbmNvZGluZyB8fCB7fSk7XG4gICAgY29uc3QgY29uZmlnID0gdGhpcy5fY29uZmlnID0gdGhpcy5faW5pdENvbmZpZyhzcGVjLmNvbmZpZywgcGFyZW50LCBtYXJrLCBlbmNvZGluZyk7XG5cbiAgICBjb25zdCBzY2FsZSA9IHRoaXMuX3NjYWxlID0gIHRoaXMuX2luaXRTY2FsZShtYXJrLCBlbmNvZGluZywgY29uZmlnKTtcbiAgICB0aGlzLl9heGlzID0gdGhpcy5faW5pdEF4aXMoZW5jb2RpbmcsIGNvbmZpZyk7XG4gICAgdGhpcy5fbGVnZW5kID0gdGhpcy5faW5pdExlZ2VuZChlbmNvZGluZywgY29uZmlnKTtcblxuICAgIC8vIGNhbGN1bGF0ZSBzdGFja1xuICAgIHRoaXMuX3N0YWNrID0gY29tcGlsZVN0YWNrUHJvcGVydGllcyhtYXJrLCBlbmNvZGluZywgc2NhbGUsIGNvbmZpZyk7XG4gIH1cblxuICBwcml2YXRlIF9pbml0RW5jb2RpbmcobWFyazogTWFyaywgZW5jb2Rpbmc6IEVuY29kaW5nKSB7XG4gICAgLy8gY2xvbmUgdG8gcHJldmVudCBzaWRlIGVmZmVjdCB0byB0aGUgb3JpZ2luYWwgc3BlY1xuICAgIGVuY29kaW5nID0gZHVwbGljYXRlKGVuY29kaW5nKTtcblxuICAgIHZsRW5jb2RpbmcuZm9yRWFjaChlbmNvZGluZywgZnVuY3Rpb24oZmllbGREZWY6IEZpZWxkRGVmLCBjaGFubmVsOiBDaGFubmVsKSB7XG4gICAgICBpZiAoIXN1cHBvcnRNYXJrKGNoYW5uZWwsIG1hcmspKSB7XG4gICAgICAgIC8vIERyb3AgdW5zdXBwb3J0ZWQgY2hhbm5lbFxuXG4gICAgICAgIC8vIEZJWE1FIGNvbnNvbGlkYXRlIHdhcm5pbmcgbWV0aG9kXG4gICAgICAgIGNvbnNvbGUud2FybihjaGFubmVsLCAnZHJvcHBlZCBhcyBpdCBpcyBpbmNvbXBhdGlibGUgd2l0aCcsIG1hcmspO1xuICAgICAgICBkZWxldGUgZmllbGREZWYuZmllbGQ7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGZpZWxkRGVmLnR5cGUpIHtcbiAgICAgICAgLy8gY29udmVydCBzaG9ydCB0eXBlIHRvIGZ1bGwgdHlwZVxuICAgICAgICBmaWVsZERlZi50eXBlID0gZ2V0RnVsbE5hbWUoZmllbGREZWYudHlwZSk7XG4gICAgICB9XG5cbiAgICAgIGlmICgoY2hhbm5lbCA9PT0gUEFUSCB8fCBjaGFubmVsID09PSBPUkRFUikgJiYgIWZpZWxkRGVmLmFnZ3JlZ2F0ZSAmJiBmaWVsZERlZi50eXBlID09PSBRVUFOVElUQVRJVkUpIHtcbiAgICAgICAgZmllbGREZWYuYWdncmVnYXRlID0gQWdncmVnYXRlT3AuTUlOO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBlbmNvZGluZztcbiAgfVxuXG4gIHByaXZhdGUgX2luaXRDb25maWcoc3BlY0NvbmZpZzogQ29uZmlnLCBwYXJlbnQ6IE1vZGVsLCBtYXJrOiBNYXJrLCBlbmNvZGluZzogRW5jb2RpbmcpIHtcbiAgICBsZXQgY29uZmlnID0gbWVyZ2VEZWVwKGR1cGxpY2F0ZShkZWZhdWx0Q29uZmlnKSwgcGFyZW50ID8gcGFyZW50LmNvbmZpZygpIDoge30sIHNwZWNDb25maWcpO1xuICAgIGNvbmZpZy5tYXJrID0gaW5pdE1hcmtDb25maWcobWFyaywgZW5jb2RpbmcsIGNvbmZpZyk7XG4gICAgcmV0dXJuIGNvbmZpZztcbiAgfVxuXG4gIHByaXZhdGUgX2luaXRTY2FsZShtYXJrOiBNYXJrLCBlbmNvZGluZzogRW5jb2RpbmcsIGNvbmZpZzogQ29uZmlnKTogRGljdDxTY2FsZT4ge1xuICAgIHJldHVybiBVTklUX1NDQUxFX0NIQU5ORUxTLnJlZHVjZShmdW5jdGlvbihfc2NhbGUsIGNoYW5uZWwpIHtcbiAgICAgIGlmICh2bEVuY29kaW5nLmhhcyhlbmNvZGluZywgY2hhbm5lbCkgfHxcbiAgICAgICAgICAoY2hhbm5lbCA9PT0gWCAmJiB2bEVuY29kaW5nLmhhcyhlbmNvZGluZywgWDIpKSB8fFxuICAgICAgICAgIChjaGFubmVsID09PSBZICYmIHZsRW5jb2RpbmcuaGFzKGVuY29kaW5nLCBZMikpKSB7XG5cbiAgICAgICAgbGV0IHRhcmdldENoYW5uZWwgPSBjaGFubmVsO1xuICAgICAgICBpZiAoIXZsRW5jb2RpbmcuaGFzKGVuY29kaW5nLCBjaGFubmVsKSkge1xuICAgICAgICAgIHRhcmdldENoYW5uZWwgPSBjaGFubmVsID09PSBYID8gWDIgOiBZMjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjaGFubmVsRGVmID0gZW5jb2RpbmdbdGFyZ2V0Q2hhbm5lbF07XG4gICAgICAgIGNvbnN0IHNjYWxlU3BlYyA9IGNoYW5uZWxEZWYuc2NhbGUgfHwge307XG5cbiAgICAgICAgY29uc3QgX3NjYWxlVHlwZSA9IHNjYWxlVHlwZShzY2FsZVNwZWMsIGNoYW5uZWxEZWYsIGNoYW5uZWwsIG1hcmspO1xuXG4gICAgICAgIF9zY2FsZVtjaGFubmVsXSA9IGV4dGVuZCh7XG4gICAgICAgICAgdHlwZTogX3NjYWxlVHlwZSxcbiAgICAgICAgICByb3VuZDogY29uZmlnLnNjYWxlLnJvdW5kLFxuICAgICAgICAgIHBhZGRpbmc6IGNvbmZpZy5zY2FsZS5wYWRkaW5nLFxuICAgICAgICAgIHVzZVJhd0RvbWFpbjogY29uZmlnLnNjYWxlLnVzZVJhd0RvbWFpbixcbiAgICAgICAgICBiYW5kU2l6ZTogY2hhbm5lbCA9PT0gWCAmJiBfc2NhbGVUeXBlID09PSBTY2FsZVR5cGUuT1JESU5BTCAmJiBtYXJrID09PSBURVhUTUFSSyA/XG4gICAgICAgICAgICAgICAgICAgICBjb25maWcuc2NhbGUudGV4dEJhbmRXaWR0aCA6IGNvbmZpZy5zY2FsZS5iYW5kU2l6ZVxuICAgICAgICB9LCBzY2FsZVNwZWMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF9zY2FsZTtcbiAgICB9LCB7fSBhcyBEaWN0PFNjYWxlPik7XG4gIH1cblxuICBwcml2YXRlIF9pbml0QXhpcyhlbmNvZGluZzogRW5jb2RpbmcsIGNvbmZpZzogQ29uZmlnKTogRGljdDxBeGlzPiB7XG4gICAgcmV0dXJuIFtYLCBZXS5yZWR1Y2UoZnVuY3Rpb24oX2F4aXMsIGNoYW5uZWwpIHtcbiAgICAgIC8vIFBvc2l0aW9uIEF4aXNcbiAgICAgIGlmICh2bEVuY29kaW5nLmhhcyhlbmNvZGluZywgY2hhbm5lbCkgfHxcbiAgICAgICAgICAoY2hhbm5lbCA9PT0gWCAmJiB2bEVuY29kaW5nLmhhcyhlbmNvZGluZywgWDIpKSB8fFxuICAgICAgICAgIChjaGFubmVsID09PSBZICYmIHZsRW5jb2RpbmcuaGFzKGVuY29kaW5nLCBZMikpKSB7XG5cbiAgICAgICAgbGV0IHRhcmdldENoYW5uZWwgPSBjaGFubmVsO1xuICAgICAgICBpZiAoIXZsRW5jb2RpbmcuaGFzKGVuY29kaW5nLCBjaGFubmVsKSkge1xuICAgICAgICAgIHRhcmdldENoYW5uZWwgPSBjaGFubmVsID09PSBYID8gWDIgOiBZMjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBheGlzU3BlYyA9IGVuY29kaW5nW3RhcmdldENoYW5uZWxdLmF4aXM7XG4gICAgICAgIGlmIChheGlzU3BlYyAhPT0gZmFsc2UpIHtcbiAgICAgICAgICBfYXhpc1tjaGFubmVsXSA9IGV4dGVuZCh7fSxcbiAgICAgICAgICAgIGNvbmZpZy5heGlzLFxuICAgICAgICAgICAgYXhpc1NwZWMgPT09IHRydWUgPyB7fSA6IGF4aXNTcGVjIHx8ICB7fVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBfYXhpcztcbiAgICB9LCB7fSBhcyBEaWN0PEF4aXM+KTtcbiAgfVxuXG4gIHByaXZhdGUgX2luaXRMZWdlbmQoZW5jb2Rpbmc6IEVuY29kaW5nLCBjb25maWc6IENvbmZpZyk6IERpY3Q8TGVnZW5kPiB7XG4gICAgcmV0dXJuIE5PTlNQQVRJQUxfU0NBTEVfQ0hBTk5FTFMucmVkdWNlKGZ1bmN0aW9uKF9sZWdlbmQsIGNoYW5uZWwpIHtcbiAgICAgIGlmICh2bEVuY29kaW5nLmhhcyhlbmNvZGluZywgY2hhbm5lbCkpIHtcbiAgICAgICAgY29uc3QgbGVnZW5kU3BlYyA9IGVuY29kaW5nW2NoYW5uZWxdLmxlZ2VuZDtcbiAgICAgICAgaWYgKGxlZ2VuZFNwZWMgIT09IGZhbHNlKSB7XG4gICAgICAgICAgX2xlZ2VuZFtjaGFubmVsXSA9IGV4dGVuZCh7fSwgY29uZmlnLmxlZ2VuZCxcbiAgICAgICAgICAgIGxlZ2VuZFNwZWMgPT09IHRydWUgPyB7fSA6IGxlZ2VuZFNwZWMgfHwgIHt9XG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIF9sZWdlbmQ7XG4gICAgfSwge30gYXMgRGljdDxMZWdlbmQ+KTtcbiAgfVxuXG4gIHB1YmxpYyBwYXJzZURhdGEoKSB7XG4gICAgdGhpcy5jb21wb25lbnQuZGF0YSA9IHBhcnNlVW5pdERhdGEodGhpcyk7XG4gIH1cblxuICBwdWJsaWMgcGFyc2VTZWxlY3Rpb25EYXRhKCkge1xuICAgIC8vIFRPRE86IEBhcnZpbmQgY2FuIHdyaXRlIHRoaXNcbiAgICAvLyBXZSBtaWdodCBuZWVkIHRvIHNwbGl0IHRoaXMgaW50byBjb21waWxlU2VsZWN0aW9uRGF0YSBhbmQgY29tcGlsZVNlbGVjdGlvblNpZ25hbHM/XG4gIH1cblxuICBwdWJsaWMgcGFyc2VMYXlvdXREYXRhKCkge1xuICAgIHRoaXMuY29tcG9uZW50LmxheW91dCA9IHBhcnNlVW5pdExheW91dCh0aGlzKTtcbiAgfVxuXG4gIHB1YmxpYyBwYXJzZVNjYWxlKCkge1xuICAgIHRoaXMuY29tcG9uZW50LnNjYWxlID0gcGFyc2VTY2FsZUNvbXBvbmVudCh0aGlzKTtcbiAgfVxuXG4gIHB1YmxpYyBwYXJzZU1hcmsoKSB7XG4gICAgdGhpcy5jb21wb25lbnQubWFyayA9IHBhcnNlTWFyayh0aGlzKTtcbiAgfVxuXG4gIHB1YmxpYyBwYXJzZUF4aXMoKSB7XG4gICAgdGhpcy5jb21wb25lbnQuYXhpcyA9IHBhcnNlQXhpc0NvbXBvbmVudCh0aGlzLCBbWCwgWV0pO1xuICB9XG5cbiAgcHVibGljIHBhcnNlQXhpc0dyb3VwKCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHVibGljIHBhcnNlR3JpZEdyb3VwKCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHVibGljIHBhcnNlTGVnZW5kKCkge1xuICAgIHRoaXMuY29tcG9uZW50LmxlZ2VuZCA9IHBhcnNlTGVnZW5kQ29tcG9uZW50KHRoaXMpO1xuICB9XG5cbiAgcHVibGljIGFzc2VtYmxlRGF0YShkYXRhOiBWZ0RhdGFbXSk6IFZnRGF0YVtdIHtcbiAgICByZXR1cm4gYXNzZW1ibGVEYXRhKHRoaXMsIGRhdGEpO1xuICB9XG5cbiAgcHVibGljIGFzc2VtYmxlTGF5b3V0KGxheW91dERhdGE6IFZnRGF0YVtdKTogVmdEYXRhW10ge1xuICAgIHJldHVybiBhc3NlbWJsZUxheW91dCh0aGlzLCBsYXlvdXREYXRhKTtcbiAgfVxuXG4gIHB1YmxpYyBhc3NlbWJsZU1hcmtzKCkge1xuICAgIHJldHVybiB0aGlzLmNvbXBvbmVudC5tYXJrO1xuICB9XG5cbiAgcHVibGljIGFzc2VtYmxlUGFyZW50R3JvdXBQcm9wZXJ0aWVzKGNlbGxDb25maWc6IENlbGxDb25maWcpIHtcbiAgICByZXR1cm4gYXBwbHlDb25maWcoe30sIGNlbGxDb25maWcsIEZJTExfU1RST0tFX0NPTkZJRy5jb25jYXQoWydjbGlwJ10pKTtcbiAgfVxuXG4gIHB1YmxpYyBjaGFubmVscygpIHtcbiAgICByZXR1cm4gVU5JVF9DSEFOTkVMUztcbiAgfVxuXG4gIHByb3RlY3RlZCBtYXBwaW5nKCkge1xuICAgIHJldHVybiB0aGlzLmVuY29kaW5nKCk7XG4gIH1cblxuICBwdWJsaWMgc3RhY2soKTogU3RhY2tQcm9wZXJ0aWVzIHtcbiAgICByZXR1cm4gdGhpcy5fc3RhY2s7XG4gIH1cblxuICBwdWJsaWMgdG9TcGVjKGV4Y2x1ZGVDb25maWc/LCBleGNsdWRlRGF0YT8pIHtcbiAgICBjb25zdCBlbmNvZGluZyA9IGR1cGxpY2F0ZSh0aGlzLl9lbmNvZGluZyk7XG4gICAgbGV0IHNwZWM6IGFueTtcblxuICAgIHNwZWMgPSB7XG4gICAgICBtYXJrOiB0aGlzLl9tYXJrLFxuICAgICAgZW5jb2Rpbmc6IGVuY29kaW5nXG4gICAgfTtcblxuICAgIGlmICghZXhjbHVkZUNvbmZpZykge1xuICAgICAgc3BlYy5jb25maWcgPSBkdXBsaWNhdGUodGhpcy5fY29uZmlnKTtcbiAgICB9XG5cbiAgICBpZiAoIWV4Y2x1ZGVEYXRhKSB7XG4gICAgICBzcGVjLmRhdGEgPSBkdXBsaWNhdGUodGhpcy5fZGF0YSk7XG4gICAgfVxuXG4gICAgLy8gcmVtb3ZlIGRlZmF1bHRzXG4gICAgcmV0dXJuIHNwZWM7XG4gIH1cblxuICBwdWJsaWMgbWFyaygpOiBNYXJrIHtcbiAgICByZXR1cm4gdGhpcy5fbWFyaztcbiAgfVxuXG4gIHB1YmxpYyBoYXMoY2hhbm5lbDogQ2hhbm5lbCkge1xuICAgIHJldHVybiB2bEVuY29kaW5nLmhhcyh0aGlzLl9lbmNvZGluZywgY2hhbm5lbCk7XG4gIH1cblxuICBwdWJsaWMgZW5jb2RpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuY29kaW5nO1xuICB9XG5cbiAgcHVibGljIGZpZWxkRGVmKGNoYW5uZWw6IENoYW5uZWwpOiBGaWVsZERlZiB7XG4gICAgLy8gVE9ETzogcmVtb3ZlIHRoaXMgfHwge31cbiAgICAvLyBDdXJyZW50bHkgd2UgaGF2ZSBpdCB0byBwcmV2ZW50IG51bGwgcG9pbnRlciBleGNlcHRpb24uXG4gICAgcmV0dXJuIHRoaXMuX2VuY29kaW5nW2NoYW5uZWxdIHx8IHt9O1xuICB9XG5cbiAgLyoqIEdldCBcImZpZWxkXCIgcmVmZXJlbmNlIGZvciB2ZWdhICovXG4gIHB1YmxpYyBmaWVsZChjaGFubmVsOiBDaGFubmVsLCBvcHQ6IEZpZWxkUmVmT3B0aW9uID0ge30pIHtcbiAgICBjb25zdCBmaWVsZERlZiA9IHRoaXMuZmllbGREZWYoY2hhbm5lbCk7XG5cbiAgICBpZiAoZmllbGREZWYuYmluKSB7IC8vIGJpbiBoYXMgZGVmYXVsdCBzdWZmaXggdGhhdCBkZXBlbmRzIG9uIHNjYWxlVHlwZVxuICAgICAgb3B0ID0gZXh0ZW5kKHtcbiAgICAgICAgYmluU3VmZml4OiB0aGlzLnNjYWxlKGNoYW5uZWwpLnR5cGUgPT09IFNjYWxlVHlwZS5PUkRJTkFMID8gJ19yYW5nZScgOiAnX3N0YXJ0J1xuICAgICAgfSwgb3B0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmllbGQoZmllbGREZWYsIG9wdCk7XG4gIH1cblxuICBwdWJsaWMgZGF0YVRhYmxlKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGFOYW1lKHZsRW5jb2RpbmcuaXNBZ2dyZWdhdGUodGhpcy5fZW5jb2RpbmcpID8gU1VNTUFSWSA6IFNPVVJDRSk7XG4gIH1cblxuICBwdWJsaWMgaXNVbml0KCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG4iLCJpbXBvcnQge1NjYWxlQ29uZmlnLCBGYWNldFNjYWxlQ29uZmlnLCBkZWZhdWx0U2NhbGVDb25maWcsIGRlZmF1bHRGYWNldFNjYWxlQ29uZmlnfSBmcm9tICcuL3NjYWxlJztcbmltcG9ydCB7QXhpc0NvbmZpZywgZGVmYXVsdEF4aXNDb25maWcsIGRlZmF1bHRGYWNldEF4aXNDb25maWd9IGZyb20gJy4vYXhpcyc7XG5pbXBvcnQge0xlZ2VuZENvbmZpZywgZGVmYXVsdExlZ2VuZENvbmZpZ30gZnJvbSAnLi9sZWdlbmQnO1xuXG5leHBvcnQgaW50ZXJmYWNlIENlbGxDb25maWcge1xuICB3aWR0aD86IG51bWJlcjtcbiAgaGVpZ2h0PzogbnVtYmVyO1xuXG4gIGNsaXA/OiBib29sZWFuO1xuXG4gIC8vIEZJTExfU1RST0tFX0NPTkZJR1xuICAvKipcbiAgICogQGZvcm1hdCBjb2xvclxuICAgKi9cbiAgZmlsbD86IHN0cmluZztcbiAgZmlsbE9wYWNpdHk/OiBudW1iZXI7XG4gIHN0cm9rZT86IHN0cmluZztcbiAgc3Ryb2tlV2lkdGg/OiBudW1iZXI7XG4gIHN0cm9rZU9wYWNpdHk/OiBudW1iZXI7XG4gIC8qKiBBbiBhcnJheSBvZiBhbHRlcm5hdGluZyBzdHJva2UsIHNwYWNlIGxlbmd0aHMgZm9yIGNyZWF0aW5nIGRhc2hlZCBvciBkb3R0ZWQgbGluZXMuICovXG4gIHN0cm9rZURhc2g/OiBudW1iZXJbXTtcbiAgLyoqIFRoZSBvZmZzZXQgKGluIHBpeGVscykgaW50byB3aGljaCB0byBiZWdpbiBkcmF3aW5nIHdpdGggdGhlIHN0cm9rZSBkYXNoIGFycmF5LiAqL1xuICBzdHJva2VEYXNoT2Zmc2V0PzogbnVtYmVyO1xufVxuXG5leHBvcnQgY29uc3QgZGVmYXVsdENlbGxDb25maWc6IENlbGxDb25maWcgPSB7XG4gIHdpZHRoOiAyMDAsXG4gIGhlaWdodDogMjAwXG59O1xuXG5leHBvcnQgY29uc3QgZGVmYXVsdEZhY2V0Q2VsbENvbmZpZzogQ2VsbENvbmZpZyA9IHtcbiAgc3Ryb2tlOiAnI2NjYycsXG4gIHN0cm9rZVdpZHRoOiAxXG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIEZhY2V0Q29uZmlnIHtcbiAgc2NhbGU/OiBGYWNldFNjYWxlQ29uZmlnO1xuICBheGlzPzogQXhpc0NvbmZpZztcbiAgZ3JpZD86IEZhY2V0R3JpZENvbmZpZztcbiAgY2VsbD86IENlbGxDb25maWc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRmFjZXRHcmlkQ29uZmlnIHtcbiAgLyoqIEBmb3JtYXQgY29sb3IgKi9cbiAgY29sb3I/OiBzdHJpbmc7XG4gIG9wYWNpdHk/OiBudW1iZXI7XG4gIG9mZnNldD86IG51bWJlcjtcbn1cblxuY29uc3QgZGVmYXVsdEZhY2V0R3JpZENvbmZpZzogRmFjZXRHcmlkQ29uZmlnID0ge1xuICBjb2xvcjogJyMwMDAwMDAnLFxuICBvcGFjaXR5OiAwLjQsXG4gIG9mZnNldDogMFxufTtcblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRGYWNldENvbmZpZzogRmFjZXRDb25maWcgPSB7XG4gIHNjYWxlOiBkZWZhdWx0RmFjZXRTY2FsZUNvbmZpZyxcbiAgYXhpczogZGVmYXVsdEZhY2V0QXhpc0NvbmZpZyxcbiAgZ3JpZDogZGVmYXVsdEZhY2V0R3JpZENvbmZpZyxcbiAgY2VsbDogZGVmYXVsdEZhY2V0Q2VsbENvbmZpZ1xufTtcblxuZXhwb3J0IGVudW0gRm9udFdlaWdodCB7XG4gICAgTk9STUFMID0gJ25vcm1hbCcgYXMgYW55LFxuICAgIEJPTEQgPSAnYm9sZCcgYXMgYW55XG59XG5cbmV4cG9ydCBlbnVtIFNoYXBlIHtcbiAgICBDSVJDTEUgPSAnY2lyY2xlJyBhcyBhbnksXG4gICAgU1FVQVJFID0gJ3NxdWFyZScgYXMgYW55LFxuICAgIENST1NTID0gJ2Nyb3NzJyBhcyBhbnksXG4gICAgRElBTU9ORCA9ICdkaWFtb25kJyBhcyBhbnksXG4gICAgVFJJQU5HTEVVUCA9ICd0cmlhbmdsZS11cCcgYXMgYW55LFxuICAgIFRSSUFOR0xFRE9XTiA9ICd0cmlhbmdsZS1kb3duJyBhcyBhbnksXG59XG5cbmV4cG9ydCBlbnVtIEhvcml6b250YWxBbGlnbiB7XG4gICAgTEVGVCA9ICdsZWZ0JyBhcyBhbnksXG4gICAgUklHSFQgPSAncmlnaHQnIGFzIGFueSxcbiAgICBDRU5URVIgPSAnY2VudGVyJyBhcyBhbnksXG59XG5cbmV4cG9ydCBlbnVtIFZlcnRpY2FsQWxpZ24ge1xuICAgIFRPUCA9ICd0b3AnIGFzIGFueSxcbiAgICBNSURETEUgPSAnbWlkZGxlJyBhcyBhbnksXG4gICAgQk9UVE9NID0gJ2JvdHRvbScgYXMgYW55LFxufVxuXG5leHBvcnQgZW51bSBGb250U3R5bGUge1xuICAgIE5PUk1BTCA9ICdub3JtYWwnIGFzIGFueSxcbiAgICBJVEFMSUMgPSAnaXRhbGljJyBhcyBhbnksXG59XG5cbmV4cG9ydCBlbnVtIFN0YWNrT2Zmc2V0IHtcbiAgICBaRVJPID0gJ3plcm8nIGFzIGFueSxcbiAgICBDRU5URVIgPSAnY2VudGVyJyBhcyBhbnksXG4gICAgTk9STUFMSVpFID0gJ25vcm1hbGl6ZScgYXMgYW55LFxuICAgIE5PTkUgPSAnbm9uZScgYXMgYW55LFxufVxuXG5leHBvcnQgZW51bSBJbnRlcnBvbGF0ZSB7XG4gICAgLyoqIHBpZWNld2lzZSBsaW5lYXIgc2VnbWVudHMsIGFzIGluIGEgcG9seWxpbmUgKi9cbiAgICBMSU5FQVIgPSAnbGluZWFyJyBhcyBhbnksXG4gICAgLyoqIGNsb3NlIHRoZSBsaW5lYXIgc2VnbWVudHMgdG8gZm9ybSBhIHBvbHlnb24gKi9cbiAgICBMSU5FQVJfQ0xPU0VEID0gJ2xpbmVhci1jbG9zZWQnIGFzIGFueSxcbiAgICAvKiogYWx0ZXJuYXRlIGJldHdlZW4gaG9yaXpvbnRhbCBhbmQgdmVydGljYWwgc2VnbWVudHMsIGFzIGluIGEgc3RlcCBmdW5jdGlvbiAqL1xuICAgIFNURVAgPSAnc3RlcCcgYXMgYW55LFxuICAgIC8qKiBhbHRlcm5hdGUgYmV0d2VlbiB2ZXJ0aWNhbCBhbmQgaG9yaXpvbnRhbCBzZWdtZW50cywgYXMgaW4gYSBzdGVwIGZ1bmN0aW9uICovXG4gICAgU1RFUF9CRUZPUkUgPSAnc3RlcC1iZWZvcmUnIGFzIGFueSxcbiAgICAvKiogYWx0ZXJuYXRlIGJldHdlZW4gaG9yaXpvbnRhbCBhbmQgdmVydGljYWwgc2VnbWVudHMsIGFzIGluIGEgc3RlcCBmdW5jdGlvbiAqL1xuICAgIFNURVBfQUZURVIgPSAnc3RlcC1hZnRlcicgYXMgYW55LFxuICAgIC8qKiBhIEItc3BsaW5lLCB3aXRoIGNvbnRyb2wgcG9pbnQgZHVwbGljYXRpb24gb24gdGhlIGVuZHMgKi9cbiAgICBCQVNJUyA9ICdiYXNpcycgYXMgYW55LFxuICAgIC8qKiBhbiBvcGVuIEItc3BsaW5lOyBtYXkgbm90IGludGVyc2VjdCB0aGUgc3RhcnQgb3IgZW5kICovXG4gICAgQkFTSVNfT1BFTiA9ICdiYXNpcy1vcGVuJyBhcyBhbnksXG4gICAgLyoqIGEgY2xvc2VkIEItc3BsaW5lLCBhcyBpbiBhIGxvb3AgKi9cbiAgICBCQVNJU19DTE9TRUQgPSAnYmFzaXMtY2xvc2VkJyBhcyBhbnksXG4gICAgLyoqIGEgQ2FyZGluYWwgc3BsaW5lLCB3aXRoIGNvbnRyb2wgcG9pbnQgZHVwbGljYXRpb24gb24gdGhlIGVuZHMgKi9cbiAgICBDQVJESU5BTCA9ICdjYXJkaW5hbCcgYXMgYW55LFxuICAgIC8qKiBhbiBvcGVuIENhcmRpbmFsIHNwbGluZTsgbWF5IG5vdCBpbnRlcnNlY3QgdGhlIHN0YXJ0IG9yIGVuZCwgYnV0IHdpbGwgaW50ZXJzZWN0IG90aGVyIGNvbnRyb2wgcG9pbnRzICovXG4gICAgQ0FSRElOQUxfT1BFTiA9ICdjYXJkaW5hbC1vcGVuJyBhcyBhbnksXG4gICAgLyoqIGEgY2xvc2VkIENhcmRpbmFsIHNwbGluZSwgYXMgaW4gYSBsb29wICovXG4gICAgQ0FSRElOQUxfQ0xPU0VEID0gJ2NhcmRpbmFsLWNsb3NlZCcgYXMgYW55LFxuICAgIC8qKiBlcXVpdmFsZW50IHRvIGJhc2lzLCBleGNlcHQgdGhlIHRlbnNpb24gcGFyYW1ldGVyIGlzIHVzZWQgdG8gc3RyYWlnaHRlbiB0aGUgc3BsaW5lICovXG4gICAgQlVORExFID0gJ2J1bmRsZScgYXMgYW55LFxuICAgIC8qKiBjdWJpYyBpbnRlcnBvbGF0aW9uIHRoYXQgcHJlc2VydmVzIG1vbm90b25pY2l0eSBpbiB5ICovXG4gICAgTU9OT1RPTkUgPSAnbW9ub3RvbmUnIGFzIGFueSxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNYXJrQ29uZmlnIHtcblxuICAvLyAtLS0tLS0tLS0tIENvbG9yIC0tLS0tLS0tLS1cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIHNoYXBlXFwncyBjb2xvciBzaG91bGQgYmUgdXNlZCBhcyBmaWxsIGNvbG9yIGluc3RlYWQgb2Ygc3Ryb2tlIGNvbG9yLlxuICAgKiBUaGlzIGlzIG9ubHkgYXBwbGljYWJsZSBmb3IgXCJiYXJcIiwgXCJwb2ludFwiLCBhbmQgXCJhcmVhXCIuXG4gICAqIEFsbCBtYXJrcyBleGNlcHQgXCJwb2ludFwiIG1hcmtzIGFyZSBmaWxsZWQgYnkgZGVmYXVsdC5cbiAgICogU2VlIE1hcmsgRG9jdW1lbnRhdGlvbiAoaHR0cDovL3ZlZ2EuZ2l0aHViLmlvL3ZlZ2EtbGl0ZS9kb2NzL21hcmtzLmh0bWwpXG4gICAqIGZvciB1c2FnZSBleGFtcGxlLlxuICAgKi9cbiAgZmlsbGVkPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIERlZmF1bHQgY29sb3IuXG4gICAqIEBmb3JtYXQgY29sb3JcbiAgICovXG4gIGNvbG9yPzogc3RyaW5nO1xuICAvKipcbiAgICogRGVmYXVsdCBGaWxsIENvbG9yLiAgVGhpcyBoYXMgaGlnaGVyIHByZWNlZGVuY2UgdGhhbiBjb25maWcuY29sb3JcbiAgICogQGZvcm1hdCBjb2xvclxuICAgKi9cbiAgZmlsbD86IHN0cmluZztcbiAgLyoqXG4gICAqIERlZmF1bHQgU3Ryb2tlIENvbG9yLiAgVGhpcyBoYXMgaGlnaGVyIHByZWNlZGVuY2UgdGhhbiBjb25maWcuY29sb3JcbiAgICogQGZvcm1hdCBjb2xvclxuICAgKi9cbiAgc3Ryb2tlPzogc3RyaW5nO1xuXG5cbiAgLy8gLS0tLS0tLS0tLSBPcGFjaXR5IC0tLS0tLS0tLS1cbiAgLyoqXG4gICAqIEBtaW5pbXVtIDBcbiAgICogQG1heGltdW0gMVxuICAgKi9cbiAgb3BhY2l0eT86IG51bWJlcjtcblxuICAvKipcbiAgICogQG1pbmltdW0gMFxuICAgKiBAbWF4aW11bSAxXG4gICAqL1xuICBmaWxsT3BhY2l0eT86IG51bWJlcjtcblxuICAvKipcbiAgICogQG1pbmltdW0gMFxuICAgKiBAbWF4aW11bSAxXG4gICAqL1xuICBzdHJva2VPcGFjaXR5PzogbnVtYmVyO1xuXG4gIC8vIC0tLS0tLS0tLS0gU3Ryb2tlIFN0eWxlIC0tLS0tLS0tLS1cbiAgLyoqXG4gICAqIEBtaW5pbXVtIDBcbiAgICovXG4gIHN0cm9rZVdpZHRoPzogbnVtYmVyO1xuICAvKipcbiAgICogQW4gYXJyYXkgb2YgYWx0ZXJuYXRpbmcgc3Ryb2tlLCBzcGFjZSBsZW5ndGhzIGZvciBjcmVhdGluZyBkYXNoZWQgb3IgZG90dGVkIGxpbmVzLlxuICAgKi9cbiAgc3Ryb2tlRGFzaD86IG51bWJlcltdO1xuICAvKipcbiAgICogVGhlIG9mZnNldCAoaW4gcGl4ZWxzKSBpbnRvIHdoaWNoIHRvIGJlZ2luIGRyYXdpbmcgd2l0aCB0aGUgc3Ryb2tlIGRhc2ggYXJyYXkuXG4gICAqL1xuICBzdHJva2VEYXNoT2Zmc2V0PzogbnVtYmVyO1xuXG4gIC8vIC0tLS0tLS0tLS0gU3RhY2tpbmc6IEJhciAmIEFyZWEgLS0tLS0tLS0tLVxuICBzdGFja2VkPzogU3RhY2tPZmZzZXQ7XG5cbiAgLy8gLS0tLS0tLS0tLSBPcmllbnRhdGlvbjogQmFyLCBUaWNrLCBMaW5lLCBBcmVhIC0tLS0tLS0tLS1cbiAgLyoqXG4gICAqIFRoZSBvcmllbnRhdGlvbiBvZiBhIG5vbi1zdGFja2VkIGJhciwgdGljaywgYXJlYSwgYW5kIGxpbmUgY2hhcnRzLlxuICAgKiBUaGUgdmFsdWUgaXMgZWl0aGVyIGhvcml6b250YWwgKGRlZmF1bHQpIG9yIHZlcnRpY2FsLlxuICAgKiAtIEZvciBiYXIsIHJ1bGUgYW5kIHRpY2ssIHRoaXMgZGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBzaXplIG9mIHRoZSBiYXIgYW5kIHRpY2tcbiAgICogc2hvdWxkIGJlIGFwcGxpZWQgdG8geCBvciB5IGRpbWVuc2lvbi5cbiAgICogLSBGb3IgYXJlYSwgdGhpcyBwcm9wZXJ0eSBkZXRlcm1pbmVzIHRoZSBvcmllbnQgcHJvcGVydHkgb2YgdGhlIFZlZ2Egb3V0cHV0LlxuICAgKiAtIEZvciBsaW5lLCB0aGlzIHByb3BlcnR5IGRldGVybWluZXMgdGhlIHNvcnQgb3JkZXIgb2YgdGhlIHBvaW50cyBpbiB0aGUgbGluZVxuICAgKiBpZiBgY29uZmlnLnNvcnRMaW5lQnlgIGlzIG5vdCBzcGVjaWZpZWQuXG4gICAqIEZvciBzdGFja2VkIGNoYXJ0cywgdGhpcyBpcyBhbHdheXMgZGV0ZXJtaW5lZCBieSB0aGUgb3JpZW50YXRpb24gb2YgdGhlIHN0YWNrO1xuICAgKiB0aGVyZWZvcmUgZXhwbGljaXRseSBzcGVjaWZpZWQgdmFsdWUgd2lsbCBiZSBpZ25vcmVkLlxuICAgKi9cbiAgb3JpZW50Pzogc3RyaW5nO1xuXG4gIC8vIC0tLS0tLS0tLS0gSW50ZXJwb2xhdGlvbjogTGluZSAvIGFyZWEgLS0tLS0tLS0tLVxuICAvKipcbiAgICogVGhlIGxpbmUgaW50ZXJwb2xhdGlvbiBtZXRob2QgdG8gdXNlLiBPbmUgb2YgbGluZWFyLCBzdGVwLWJlZm9yZSwgc3RlcC1hZnRlciwgYmFzaXMsIGJhc2lzLW9wZW4sIGNhcmRpbmFsLCBjYXJkaW5hbC1vcGVuLCBtb25vdG9uZS5cbiAgICovXG4gIGludGVycG9sYXRlPzogSW50ZXJwb2xhdGU7XG4gIC8qKlxuICAgKiBEZXBlbmRpbmcgb24gdGhlIGludGVycG9sYXRpb24gdHlwZSwgc2V0cyB0aGUgdGVuc2lvbiBwYXJhbWV0ZXIuXG4gICAqL1xuICB0ZW5zaW9uPzogbnVtYmVyO1xuXG4gIC8vIC0tLS0tLS0tLS0gTGluZSAtLS0tLS0tLS1cbiAgLyoqXG4gICAqIFNpemUgb2YgbGluZSBtYXJrLlxuICAgKi9cbiAgbGluZVNpemU/OiBudW1iZXI7XG5cbiAgLy8gLS0tLS0tLS0tLSBSdWxlIC0tLS0tLS0tLVxuICAvKipcbiAgICogU2l6ZSBvZiBydWxlIG1hcmsuXG4gICAqL1xuICBydWxlU2l6ZT86IG51bWJlcjtcblxuICAvLyAtLS0tLS0tLS0tIEJhciAtLS0tLS0tLS0tXG4gIC8qKlxuICAgKiBUaGUgc2l6ZSBvZiB0aGUgYmFycy4gIElmIHVuc3BlY2lmaWVkLCB0aGUgZGVmYXVsdCBzaXplIGlzICBgYmFuZFNpemUtMWAsXG4gICAqIHdoaWNoIHByb3ZpZGVzIDEgcGl4ZWwgb2Zmc2V0IGJldHdlZW4gYmFycy5cbiAgICovXG4gIGJhclNpemU/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBUaGUgc2l6ZSBvZiB0aGUgYmFycyBvbiBjb250aW51b3VzIHNjYWxlcy5cbiAgICovXG4gIGJhclRoaW5TaXplPzogbnVtYmVyO1xuXG4gIC8vIC0tLS0tLS0tLS0gUG9pbnQgLS0tLS0tLS0tLVxuICAvKipcbiAgICogVGhlIHN5bWJvbCBzaGFwZSB0byB1c2UuIE9uZSBvZiBjaXJjbGUgKGRlZmF1bHQpLCBzcXVhcmUsIGNyb3NzLCBkaWFtb25kLCB0cmlhbmdsZS11cCwgb3IgdHJpYW5nbGUtZG93bi5cbiAgICovXG4gIHNoYXBlPzogU2hhcGU7XG5cbiAgLy8gLS0tLS0tLS0tLSBQb2ludCBTaXplIChQb2ludCAvIFNxdWFyZSAvIENpcmNsZSkgLS0tLS0tLS0tLVxuICAvKipcbiAgICogVGhlIHBpeGVsIGFyZWEgZWFjaCB0aGUgcG9pbnQuIEZvciBleGFtcGxlOiBpbiB0aGUgY2FzZSBvZiBjaXJjbGVzLCB0aGUgcmFkaXVzIGlzIGRldGVybWluZWQgaW4gcGFydCBieSB0aGUgc3F1YXJlIHJvb3Qgb2YgdGhlIHNpemUgdmFsdWUuXG4gICAqL1xuICBzaXplPzogbnVtYmVyO1xuXG4gIC8vIC0tLS0tLS0tLS0gVGljayAtLS0tLS0tLS0tXG4gIC8qKiBUaGUgd2lkdGggb2YgdGhlIHRpY2tzLiAqL1xuICB0aWNrU2l6ZT86IG51bWJlcjtcblxuICAvKiogVGhpY2tuZXNzIG9mIHRoZSB0aWNrIG1hcmsuICovXG4gIHRpY2tUaGlja25lc3M/OiBudW1iZXI7XG5cbiAgLy8gLS0tLS0tLS0tLSBUZXh0IC0tLS0tLS0tLS1cbiAgLyoqXG4gICAqIFRoZSBob3Jpem9udGFsIGFsaWdubWVudCBvZiB0aGUgdGV4dC4gT25lIG9mIGxlZnQsIHJpZ2h0LCBjZW50ZXIuXG4gICAqL1xuICBhbGlnbj86IEhvcml6b250YWxBbGlnbjtcbiAgLyoqXG4gICAqIFRoZSByb3RhdGlvbiBhbmdsZSBvZiB0aGUgdGV4dCwgaW4gZGVncmVlcy5cbiAgICovXG4gIGFuZ2xlPzogbnVtYmVyO1xuICAvKipcbiAgICogVGhlIHZlcnRpY2FsIGFsaWdubWVudCBvZiB0aGUgdGV4dC4gT25lIG9mIHRvcCwgbWlkZGxlLCBib3R0b20uXG4gICAqL1xuICBiYXNlbGluZT86IFZlcnRpY2FsQWxpZ247XG4gIC8qKlxuICAgKiBUaGUgaG9yaXpvbnRhbCBvZmZzZXQsIGluIHBpeGVscywgYmV0d2VlbiB0aGUgdGV4dCBsYWJlbCBhbmQgaXRzIGFuY2hvciBwb2ludC4gVGhlIG9mZnNldCBpcyBhcHBsaWVkIGFmdGVyIHJvdGF0aW9uIGJ5IHRoZSBhbmdsZSBwcm9wZXJ0eS5cbiAgICovXG4gIGR4PzogbnVtYmVyO1xuICAvKipcbiAgICogVGhlIHZlcnRpY2FsIG9mZnNldCwgaW4gcGl4ZWxzLCBiZXR3ZWVuIHRoZSB0ZXh0IGxhYmVsIGFuZCBpdHMgYW5jaG9yIHBvaW50LiBUaGUgb2Zmc2V0IGlzIGFwcGxpZWQgYWZ0ZXIgcm90YXRpb24gYnkgdGhlIGFuZ2xlIHByb3BlcnR5LlxuICAgKi9cbiAgZHk/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBQb2xhciBjb29yZGluYXRlIHJhZGlhbCBvZmZzZXQsIGluIHBpeGVscywgb2YgdGhlIHRleHQgbGFiZWwgZnJvbSB0aGUgb3JpZ2luIGRldGVybWluZWQgYnkgdGhlIHggYW5kIHkgcHJvcGVydGllcy5cbiAgICovXG4gIHJhZGl1cz86IG51bWJlcjtcbiAgLyoqXG4gICAqIFBvbGFyIGNvb3JkaW5hdGUgYW5nbGUsIGluIHJhZGlhbnMsIG9mIHRoZSB0ZXh0IGxhYmVsIGZyb20gdGhlIG9yaWdpbiBkZXRlcm1pbmVkIGJ5IHRoZSB4IGFuZCB5IHByb3BlcnRpZXMuIFZhbHVlcyBmb3IgdGhldGEgZm9sbG93IHRoZSBzYW1lIGNvbnZlbnRpb24gb2YgYXJjIG1hcmsgc3RhcnRBbmdsZSBhbmQgZW5kQW5nbGUgcHJvcGVydGllczogYW5nbGVzIGFyZSBtZWFzdXJlZCBpbiByYWRpYW5zLCB3aXRoIDAgaW5kaWNhdGluZyBcIm5vcnRoXCIuXG4gICAqL1xuICB0aGV0YT86IG51bWJlcjtcbiAgLyoqXG4gICAqIFRoZSB0eXBlZmFjZSB0byBzZXQgdGhlIHRleHQgaW4gKGUuZy4sIEhlbHZldGljYSBOZXVlKS5cbiAgICovXG4gIGZvbnQ/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBUaGUgZm9udCBzaXplLCBpbiBwaXhlbHMuXG4gICAqL1xuICBmb250U2l6ZT86IG51bWJlcjtcbiAgLyoqXG4gICAqIFRoZSBmb250IHN0eWxlIChlLmcuLCBpdGFsaWMpLlxuICAgKi9cbiAgZm9udFN0eWxlPzogRm9udFN0eWxlO1xuICAvKipcbiAgICogVGhlIGZvbnQgd2VpZ2h0IChlLmcuLCBib2xkKS5cbiAgICovXG4gIGZvbnRXZWlnaHQ/OiBGb250V2VpZ2h0O1xuICAvLyBWZWdhLUxpdGUgb25seSBmb3IgdGV4dCBvbmx5XG4gIC8qKlxuICAgKiBUaGUgZm9ybWF0dGluZyBwYXR0ZXJuIGZvciB0ZXh0IHZhbHVlLiBJZiBub3QgZGVmaW5lZCwgdGhpcyB3aWxsIGJlIGRldGVybWluZWQgYXV0b21hdGljYWxseS5cbiAgICovXG4gIGZvcm1hdD86IHN0cmluZztcbiAgLyoqXG4gICAqIFdoZXRoZXIgbW9udGggbmFtZXMgYW5kIHdlZWtkYXkgbmFtZXMgc2hvdWxkIGJlIGFiYnJldmlhdGVkLlxuICAgKi9cbiAgc2hvcnRUaW1lTGFiZWxzPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIFBsYWNlaG9sZGVyIFRleHRcbiAgICovXG4gIHRleHQ/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEFwcGx5IGNvbG9yIGZpZWxkIHRvIGJhY2tncm91bmQgY29sb3IgaW5zdGVhZCBvZiB0aGUgdGV4dC5cbiAgICovXG4gIGFwcGx5Q29sb3JUb0JhY2tncm91bmQ/OiBib29sZWFuO1xufVxuXG5leHBvcnQgY29uc3QgZGVmYXVsdE1hcmtDb25maWc6IE1hcmtDb25maWcgPSB7XG4gIGNvbG9yOiAnIzQ2ODJiNCcsXG4gIHN0cm9rZVdpZHRoOiAyLFxuICBzaXplOiAzMCxcbiAgYmFyVGhpblNpemU6IDIsXG4gIC8vIGxpbmVTaXplIGlzIHVuZGVmaW5lZCBieSBkZWZhdWx0LCBhbmQgcmVmZXIgdG8gdmFsdWUgZnJvbSBzdHJva2VXaWR0aFxuICBydWxlU2l6ZTogMSxcbiAgdGlja1RoaWNrbmVzczogMSxcblxuICBmb250U2l6ZTogMTAsXG4gIGJhc2VsaW5lOiBWZXJ0aWNhbEFsaWduLk1JRERMRSxcbiAgdGV4dDogJ0FiYycsXG5cbiAgc2hvcnRUaW1lTGFiZWxzOiBmYWxzZSxcbiAgYXBwbHlDb2xvclRvQmFja2dyb3VuZDogZmFsc2Vcbn07XG5cblxuZXhwb3J0IGludGVyZmFjZSBDb25maWcge1xuICAvLyBUT0RPOiBhZGQgdGhpcyBiYWNrIG9uY2Ugd2UgaGF2ZSB0b3AtZG93biBsYXlvdXQgYXBwcm9hY2hcbiAgLy8gd2lkdGg/OiBudW1iZXI7XG4gIC8vIGhlaWdodD86IG51bWJlcjtcbiAgLy8gcGFkZGluZz86IG51bWJlcnxzdHJpbmc7XG4gIC8qKlxuICAgKiBUaGUgd2lkdGggYW5kIGhlaWdodCBvZiB0aGUgb24tc2NyZWVuIHZpZXdwb3J0LCBpbiBwaXhlbHMuIElmIG5lY2Vzc2FyeSwgY2xpcHBpbmcgYW5kIHNjcm9sbGluZyB3aWxsIGJlIGFwcGxpZWQuXG4gICAqL1xuICB2aWV3cG9ydD86IG51bWJlcjtcbiAgLyoqXG4gICAqIENTUyBjb2xvciBwcm9wZXJ0eSB0byB1c2UgYXMgYmFja2dyb3VuZCBvZiB2aXN1YWxpemF0aW9uLiBEZWZhdWx0IGlzIGBcInRyYW5zcGFyZW50XCJgLlxuICAgKi9cbiAgYmFja2dyb3VuZD86IHN0cmluZztcblxuICAvKipcbiAgICogRDMgTnVtYmVyIGZvcm1hdCBmb3IgYXhpcyBsYWJlbHMgYW5kIHRleHQgdGFibGVzLiBGb3IgZXhhbXBsZSBcInNcIiBmb3IgU0kgdW5pdHMuXG4gICAqL1xuICBudW1iZXJGb3JtYXQ/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBEZWZhdWx0IGRhdGV0aW1lIGZvcm1hdCBmb3IgYXhpcyBhbmQgbGVnZW5kIGxhYmVscy4gVGhlIGZvcm1hdCBjYW4gYmUgc2V0IGRpcmVjdGx5IG9uIGVhY2ggYXhpcyBhbmQgbGVnZW5kLlxuICAgKi9cbiAgdGltZUZvcm1hdD86IHN0cmluZztcblxuICBjZWxsPzogQ2VsbENvbmZpZztcbiAgbWFyaz86IE1hcmtDb25maWc7XG4gIHNjYWxlPzogU2NhbGVDb25maWc7XG4gIGF4aXM/OiBBeGlzQ29uZmlnO1xuICBsZWdlbmQ/OiBMZWdlbmRDb25maWc7XG5cbiAgZmFjZXQ/OiBGYWNldENvbmZpZztcbn1cblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRDb25maWc6IENvbmZpZyA9IHtcbiAgbnVtYmVyRm9ybWF0OiAncycsXG4gIHRpbWVGb3JtYXQ6ICclWS0lbS0lZCcsXG5cbiAgY2VsbDogZGVmYXVsdENlbGxDb25maWcsXG4gIG1hcms6IGRlZmF1bHRNYXJrQ29uZmlnLFxuICBzY2FsZTogZGVmYXVsdFNjYWxlQ29uZmlnLFxuICBheGlzOiBkZWZhdWx0QXhpc0NvbmZpZyxcbiAgbGVnZW5kOiBkZWZhdWx0TGVnZW5kQ29uZmlnLFxuXG4gIGZhY2V0OiBkZWZhdWx0RmFjZXRDb25maWcsXG59O1xuIiwiLypcbiAqIENvbnN0YW50cyBhbmQgdXRpbGl0aWVzIGZvciBkYXRhLlxuICovXG5pbXBvcnQge1R5cGV9IGZyb20gJy4vdHlwZSc7XG5cbmV4cG9ydCBlbnVtIERhdGFGb3JtYXQge1xuICAgIEpTT04gPSAnanNvbicgYXMgYW55LFxuICAgIENTViA9ICdjc3YnIGFzIGFueSxcbiAgICBUU1YgPSAndHN2JyBhcyBhbnksXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGF0YSB7XG4gIGZvcm1hdFR5cGU/OiBEYXRhRm9ybWF0O1xuICB1cmw/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBQYXNzIGFycmF5IG9mIG9iamVjdHMgaW5zdGVhZCBvZiBhIHVybCB0byBhIGZpbGUuXG4gICAqL1xuICB2YWx1ZXM/OiBhbnlbXTtcbn1cblxuZXhwb3J0IGVudW0gRGF0YVRhYmxlIHtcbiAgU09VUkNFID0gJ3NvdXJjZScgYXMgYW55LFxuICBTVU1NQVJZID0gJ3N1bW1hcnknIGFzIGFueSxcbiAgU1RBQ0tFRF9TQ0FMRSA9ICdzdGFja2VkX3NjYWxlJyBhcyBhbnksXG4gIExBWU9VVCA9ICdsYXlvdXQnIGFzIGFueVxufVxuXG5leHBvcnQgY29uc3QgU1VNTUFSWSA9IERhdGFUYWJsZS5TVU1NQVJZO1xuZXhwb3J0IGNvbnN0IFNPVVJDRSA9IERhdGFUYWJsZS5TT1VSQ0U7XG5leHBvcnQgY29uc3QgU1RBQ0tFRF9TQ0FMRSA9IERhdGFUYWJsZS5TVEFDS0VEX1NDQUxFO1xuZXhwb3J0IGNvbnN0IExBWU9VVCA9IERhdGFUYWJsZS5MQVlPVVQ7XG5cbi8qKiBNYXBwaW5nIGZyb20gZGF0YWxpYidzIGluZmVycmVkIHR5cGUgdG8gVmVnYS1saXRlJ3MgdHlwZSAqL1xuLy8gVE9ETzogY29uc2lkZXIgaWYgd2UgY2FuIHJlbW92ZVxuZXhwb3J0IGNvbnN0IHR5cGVzID0ge1xuICAnYm9vbGVhbic6IFR5cGUuTk9NSU5BTCxcbiAgJ251bWJlcic6IFR5cGUuUVVBTlRJVEFUSVZFLFxuICAnaW50ZWdlcic6IFR5cGUuUVVBTlRJVEFUSVZFLFxuICAnZGF0ZSc6IFR5cGUuVEVNUE9SQUwsXG4gICdzdHJpbmcnOiBUeXBlLk5PTUlOQUxcbn07XG4iLCIvLyB1dGlsaXR5IGZvciBlbmNvZGluZyBtYXBwaW5nXG5pbXBvcnQge0ZpZWxkRGVmLCBQb3NpdGlvbkNoYW5uZWxEZWYsIEZhY2V0Q2hhbm5lbERlZiwgQ2hhbm5lbERlZldpdGhMZWdlbmQsIE9yZGVyQ2hhbm5lbERlZn0gZnJvbSAnLi9maWVsZGRlZic7XG5pbXBvcnQge1gsIFksIFgyLCBZMiwgQ2hhbm5lbCwgQ0hBTk5FTFN9IGZyb20gJy4vY2hhbm5lbCc7XG5pbXBvcnQge2lzQXJyYXksIGFueSBhcyBhbnlJbn0gZnJvbSAnLi91dGlsJztcblxuLy8gVE9ETzogb25jZSB3ZSBkZWNvbXBvc2UgZmFjZXQsIHJlbmFtZSB0aGlzIHRvIEVuY29kaW5nXG5leHBvcnQgaW50ZXJmYWNlIFVuaXRFbmNvZGluZyB7XG4gIHg/OiBQb3NpdGlvbkNoYW5uZWxEZWY7XG4gIHk/OiBQb3NpdGlvbkNoYW5uZWxEZWY7XG4gIHgyPzogUG9zaXRpb25DaGFubmVsRGVmO1xuICB5Mj86IFBvc2l0aW9uQ2hhbm5lbERlZjtcbiAgY29sb3I/OiBDaGFubmVsRGVmV2l0aExlZ2VuZDtcbiAgb3BhY2l0eT86IENoYW5uZWxEZWZXaXRoTGVnZW5kO1xuICBzaXplPzogQ2hhbm5lbERlZldpdGhMZWdlbmQ7XG4gIHNoYXBlPzogQ2hhbm5lbERlZldpdGhMZWdlbmQ7IC8vIFRPRE86IG1heWJlIGRpc3Rpbmd1aXNoIG9yZGluYWwtb25seVxuICBkZXRhaWw/OiBGaWVsZERlZiB8IEZpZWxkRGVmW107XG4gIHRleHQ/OiBGaWVsZERlZjtcbiAgbGFiZWw/OiBGaWVsZERlZjtcblxuICBwYXRoPzogT3JkZXJDaGFubmVsRGVmIHwgT3JkZXJDaGFubmVsRGVmW107XG4gIG9yZGVyPzogT3JkZXJDaGFubmVsRGVmIHwgT3JkZXJDaGFubmVsRGVmW107XG59XG5cbi8vIFRPRE86IG9uY2Ugd2UgZGVjb21wb3NlIGZhY2V0LCByZW5hbWUgdGhpcyB0byBFeHRlbmRlZEVuY29kaW5nXG5leHBvcnQgaW50ZXJmYWNlIEVuY29kaW5nIGV4dGVuZHMgVW5pdEVuY29kaW5nIHtcbiAgcm93PzogRmFjZXRDaGFubmVsRGVmO1xuICBjb2x1bW4/OiBGYWNldENoYW5uZWxEZWY7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb3VudFJldGluYWwoZW5jb2Rpbmc6IEVuY29kaW5nKSB7XG4gIGxldCBjb3VudCA9IDA7XG4gIGlmIChlbmNvZGluZy5jb2xvcikgeyBjb3VudCsrOyB9XG4gIGlmIChlbmNvZGluZy5vcGFjaXR5KSB7IGNvdW50Kys7IH1cbiAgaWYgKGVuY29kaW5nLnNpemUpIHsgY291bnQrKzsgfVxuICBpZiAoZW5jb2Rpbmcuc2hhcGUpIHsgY291bnQrKzsgfVxuICByZXR1cm4gY291bnQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGFubmVscyhlbmNvZGluZzogRW5jb2RpbmcpIHtcbiAgcmV0dXJuIENIQU5ORUxTLmZpbHRlcihmdW5jdGlvbihjaGFubmVsKSB7XG4gICAgcmV0dXJuIGhhcyhlbmNvZGluZywgY2hhbm5lbCk7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzKGVuY29kaW5nOiBFbmNvZGluZywgY2hhbm5lbDogQ2hhbm5lbCk6IGJvb2xlYW4ge1xuICBjb25zdCBjaGFubmVsRW5jb2RpbmcgPSBlbmNvZGluZyAmJiBlbmNvZGluZ1tjaGFubmVsXTtcbiAgcmV0dXJuIGNoYW5uZWxFbmNvZGluZyAmJiAoXG4gICAgY2hhbm5lbEVuY29kaW5nLmZpZWxkICE9PSB1bmRlZmluZWQgfHxcbiAgICAoaXNBcnJheShjaGFubmVsRW5jb2RpbmcpICYmIGNoYW5uZWxFbmNvZGluZy5sZW5ndGggPiAwKVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNBZ2dyZWdhdGUoZW5jb2Rpbmc6IEVuY29kaW5nKSB7XG4gIHJldHVybiBhbnlJbihDSEFOTkVMUywgKGNoYW5uZWwpID0+IHtcbiAgICBpZiAoaGFzKGVuY29kaW5nLCBjaGFubmVsKSAmJiBlbmNvZGluZ1tjaGFubmVsXS5hZ2dyZWdhdGUpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNSYW5nZWQoZW5jb2Rpbmc6IEVuY29kaW5nKSB7XG4gIHJldHVybiAoaGFzKGVuY29kaW5nLCBYKSAmJiBoYXMoZW5jb2RpbmcsIFgyKSkgfHxcbiAgICAoaGFzKGVuY29kaW5nLCBZKSAmJiBoYXMoZW5jb2RpbmcsIFkyKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaWVsZERlZnMoZW5jb2Rpbmc6IEVuY29kaW5nKTogRmllbGREZWZbXSB7XG4gIGxldCBhcnIgPSBbXTtcbiAgQ0hBTk5FTFMuZm9yRWFjaChmdW5jdGlvbihjaGFubmVsKSB7XG4gICAgaWYgKGhhcyhlbmNvZGluZywgY2hhbm5lbCkpIHtcbiAgICAgIGlmIChpc0FycmF5KGVuY29kaW5nW2NoYW5uZWxdKSkge1xuICAgICAgICBlbmNvZGluZ1tjaGFubmVsXS5mb3JFYWNoKGZ1bmN0aW9uKGZpZWxkRGVmKSB7XG4gICAgICAgICAgYXJyLnB1c2goZmllbGREZWYpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFyci5wdXNoKGVuY29kaW5nW2NoYW5uZWxdKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICByZXR1cm4gYXJyO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGZvckVhY2goZW5jb2Rpbmc6IEVuY29kaW5nLFxuICAgIGY6IChmZDogRmllbGREZWYsIGM6IENoYW5uZWwsIGk6IG51bWJlcikgPT4gdm9pZCxcbiAgICB0aGlzQXJnPzogYW55KSB7XG4gIGNoYW5uZWxNYXBwaW5nRm9yRWFjaChDSEFOTkVMUywgZW5jb2RpbmcsIGYsIHRoaXNBcmcpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hhbm5lbE1hcHBpbmdGb3JFYWNoKGNoYW5uZWxzOiBDaGFubmVsW10sIG1hcHBpbmc6IGFueSxcbiAgICBmOiAoZmQ6IEZpZWxkRGVmLCBjOiBDaGFubmVsLCBpOiBudW1iZXIpID0+IHZvaWQsXG4gICAgdGhpc0FyZz86IGFueSkge1xuICBsZXQgaSA9IDA7XG4gIGNoYW5uZWxzLmZvckVhY2goZnVuY3Rpb24oY2hhbm5lbCkge1xuICAgIGlmIChoYXMobWFwcGluZywgY2hhbm5lbCkpIHtcbiAgICAgIGlmIChpc0FycmF5KG1hcHBpbmdbY2hhbm5lbF0pKSB7XG4gICAgICAgIG1hcHBpbmdbY2hhbm5lbF0uZm9yRWFjaChmdW5jdGlvbihmaWVsZERlZikge1xuICAgICAgICAgICAgZi5jYWxsKHRoaXNBcmcsIGZpZWxkRGVmLCBjaGFubmVsLCBpKyspO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGYuY2FsbCh0aGlzQXJnLCBtYXBwaW5nW2NoYW5uZWxdLCBjaGFubmVsLCBpKyspO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXAoZW5jb2Rpbmc6IEVuY29kaW5nLFxuICAgIGY6IChmZDogRmllbGREZWYsIGM6IENoYW5uZWwsIGk6IG51bWJlcikgPT4gYW55LFxuICAgIHRoaXNBcmc/OiBhbnkpIHtcbiAgcmV0dXJuIGNoYW5uZWxNYXBwaW5nTWFwKENIQU5ORUxTLCBlbmNvZGluZywgZiAsIHRoaXNBcmcpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hhbm5lbE1hcHBpbmdNYXAoY2hhbm5lbHM6IENoYW5uZWxbXSwgbWFwcGluZzogYW55LFxuICAgIGY6IChmZDogRmllbGREZWYsIGM6IENoYW5uZWwsIGk6IG51bWJlcikgPT4gYW55LFxuICAgIHRoaXNBcmc/OiBhbnkpIHtcbiAgbGV0IGFyciA9IFtdO1xuICBjaGFubmVscy5mb3JFYWNoKGZ1bmN0aW9uKGNoYW5uZWwpIHtcbiAgICBpZiAoaGFzKG1hcHBpbmcsIGNoYW5uZWwpKSB7XG4gICAgICBpZiAoaXNBcnJheShtYXBwaW5nW2NoYW5uZWxdKSkge1xuICAgICAgICBtYXBwaW5nW2NoYW5uZWxdLmZvckVhY2goZnVuY3Rpb24oZmllbGREZWYpIHtcbiAgICAgICAgICBhcnIucHVzaChmLmNhbGwodGhpc0FyZywgZmllbGREZWYsIGNoYW5uZWwpKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhcnIucHVzaChmLmNhbGwodGhpc0FyZywgbWFwcGluZ1tjaGFubmVsXSwgY2hhbm5lbCkpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIHJldHVybiBhcnI7XG59XG5leHBvcnQgZnVuY3Rpb24gcmVkdWNlKGVuY29kaW5nOiBFbmNvZGluZyxcbiAgICBmOiAoYWNjOiBhbnksIGZkOiBGaWVsZERlZiwgYzogQ2hhbm5lbCkgPT4gYW55LFxuICAgIGluaXQsXG4gICAgdGhpc0FyZz86IGFueSkge1xuICByZXR1cm4gY2hhbm5lbE1hcHBpbmdSZWR1Y2UoQ0hBTk5FTFMsIGVuY29kaW5nLCBmLCBpbml0LCB0aGlzQXJnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoYW5uZWxNYXBwaW5nUmVkdWNlKGNoYW5uZWxzOiBDaGFubmVsW10sIG1hcHBpbmc6IGFueSxcbiAgICBmOiAoYWNjOiBhbnksIGZkOiBGaWVsZERlZiwgYzogQ2hhbm5lbCkgPT4gYW55LFxuICAgIGluaXQsXG4gICAgdGhpc0FyZz86IGFueSkge1xuICBsZXQgciA9IGluaXQ7XG4gIENIQU5ORUxTLmZvckVhY2goZnVuY3Rpb24oY2hhbm5lbCkge1xuICAgIGlmIChoYXMobWFwcGluZywgY2hhbm5lbCkpIHtcbiAgICAgIGlmIChpc0FycmF5KG1hcHBpbmdbY2hhbm5lbF0pKSB7XG4gICAgICAgIG1hcHBpbmdbY2hhbm5lbF0uZm9yRWFjaChmdW5jdGlvbihmaWVsZERlZikge1xuICAgICAgICAgICAgciA9IGYuY2FsbCh0aGlzQXJnLCByLCBmaWVsZERlZiwgY2hhbm5lbCk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgciA9IGYuY2FsbCh0aGlzQXJnLCByLCBtYXBwaW5nW2NoYW5uZWxdLCBjaGFubmVsKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcjtcbn1cbiIsIi8vIHV0aWxpdHkgZm9yIGEgZmllbGQgZGVmaW5pdGlvbiBvYmplY3RcblxuaW1wb3J0IHtBZ2dyZWdhdGVPcCwgQUdHUkVHQVRFX09QU30gZnJvbSAnLi9hZ2dyZWdhdGUnO1xuaW1wb3J0IHtBeGlzfSBmcm9tICcuL2F4aXMnO1xuaW1wb3J0IHtCaW59IGZyb20gJy4vYmluJztcbmltcG9ydCB7TGVnZW5kfSBmcm9tICcuL2xlZ2VuZCc7XG5pbXBvcnQge1NjYWxlfSBmcm9tICcuL3NjYWxlJztcbmltcG9ydCB7U29ydEZpZWxkLCBTb3J0T3JkZXJ9IGZyb20gJy4vc29ydCc7XG5pbXBvcnQge1RpbWVVbml0fSBmcm9tICcuL3RpbWV1bml0JztcbmltcG9ydCB7VHlwZSwgTk9NSU5BTCwgT1JESU5BTCwgUVVBTlRJVEFUSVZFLCBURU1QT1JBTH0gZnJvbSAnLi90eXBlJztcbmltcG9ydCB7Y29udGFpbnMsIGdldGJpbnMsIHRvTWFwfSBmcm9tICcuL3V0aWwnO1xuXG4vKipcbiAqICBJbnRlcmZhY2UgZm9yIGFueSBraW5kIG9mIEZpZWxkRGVmO1xuICogIEZvciBzaW1wbGljaXR5LCB3ZSBkbyBub3QgZGVjbGFyZSBtdWx0aXBsZSBpbnRlcmZhY2VzIG9mIEZpZWxkRGVmIGxpa2VcbiAqICB3ZSBkbyBmb3IgSlNPTiBzY2hlbWEuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRmllbGREZWYge1xuICBmaWVsZD86IHN0cmluZztcbiAgdHlwZT86IFR5cGU7XG4gIHZhbHVlPzogbnVtYmVyIHwgc3RyaW5nIHwgYm9vbGVhbjtcblxuICAvLyBmdW5jdGlvblxuICB0aW1lVW5pdD86IFRpbWVVbml0O1xuICBiaW4/OiBib29sZWFuIHwgQmluO1xuICBhZ2dyZWdhdGU/OiBBZ2dyZWdhdGVPcDtcblxuICAvLyBtZXRhZGF0YVxuICB0aXRsZT86IHN0cmluZztcbn1cblxuZXhwb3J0IGNvbnN0IGFnZ3JlZ2F0ZSA9IHtcbiAgdHlwZTogJ3N0cmluZycsXG4gIGVudW06IEFHR1JFR0FURV9PUFMsXG4gIHN1cHBvcnRlZEVudW1zOiB7XG4gICAgcXVhbnRpdGF0aXZlOiBBR0dSRUdBVEVfT1BTLFxuICAgIG9yZGluYWw6IFsnbWVkaWFuJywnbWluJywnbWF4J10sXG4gICAgbm9taW5hbDogW10sXG4gICAgdGVtcG9yYWw6IFsnbWVhbicsICdtZWRpYW4nLCAnbWluJywgJ21heCddLCAvLyBUT0RPOiByZXZpc2Ugd2hhdCBzaG91bGQgdGltZSBzdXBwb3J0XG4gICAgJyc6IFsnY291bnQnXVxuICB9LFxuICBzdXBwb3J0ZWRUeXBlczogdG9NYXAoW1FVQU5USVRBVElWRSwgTk9NSU5BTCwgT1JESU5BTCwgVEVNUE9SQUwsICcnXSlcbn07XG5leHBvcnQgaW50ZXJmYWNlIENoYW5uZWxEZWZXaXRoU2NhbGUgZXh0ZW5kcyBGaWVsZERlZiB7XG4gIHNjYWxlPzogU2NhbGU7XG4gIHNvcnQ/OiBTb3J0RmllbGQgfCBTb3J0T3JkZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUG9zaXRpb25DaGFubmVsRGVmIGV4dGVuZHMgQ2hhbm5lbERlZldpdGhTY2FsZSB7XG4gIGF4aXM/OiBib29sZWFuIHwgQXhpcztcbn1cbmV4cG9ydCBpbnRlcmZhY2UgQ2hhbm5lbERlZldpdGhMZWdlbmQgZXh0ZW5kcyBDaGFubmVsRGVmV2l0aFNjYWxlIHtcbiAgbGVnZW5kPzogTGVnZW5kO1xufVxuXG4vLyBEZXRhaWxcblxuLy8gT3JkZXIgUGF0aCBoYXZlIG5vIHNjYWxlXG5cbmV4cG9ydCBpbnRlcmZhY2UgT3JkZXJDaGFubmVsRGVmIGV4dGVuZHMgRmllbGREZWYge1xuICBzb3J0PzogU29ydE9yZGVyO1xufVxuXG4vLyBUT0RPOiBjb25zaWRlciBpZiB3ZSB3YW50IHRvIGRpc3Rpbmd1aXNoIG9yZGluYWxPbmx5U2NhbGUgZnJvbSBzY2FsZVxuZXhwb3J0IHR5cGUgRmFjZXRDaGFubmVsRGVmID0gUG9zaXRpb25DaGFubmVsRGVmO1xuXG5cblxuZXhwb3J0IGludGVyZmFjZSBGaWVsZFJlZk9wdGlvbiB7XG4gIC8qKiBleGNsdWRlIGJpbiwgYWdncmVnYXRlLCB0aW1lVW5pdCAqL1xuICBub2ZuPzogYm9vbGVhbjtcbiAgLyoqIGV4Y2x1ZGUgYWdncmVnYXRpb24gZnVuY3Rpb24gKi9cbiAgbm9BZ2dyZWdhdGU/OiBib29sZWFuO1xuICAvKiogaW5jbHVkZSAnZGF0dW0uJyAqL1xuICBkYXR1bT86IGJvb2xlYW47XG4gIC8qKiByZXBsYWNlIGZuIHdpdGggY3VzdG9tIGZ1bmN0aW9uIHByZWZpeCAqL1xuICBmbj86IHN0cmluZztcbiAgLyoqIHByZXBlbmQgZm4gd2l0aCBjdXN0b20gZnVuY3Rpb24gcHJlZml4ICovXG4gIHByZWZuPzogc3RyaW5nO1xuICAvKiogYXBwZW5kIHN1ZmZpeCB0byB0aGUgZmllbGQgcmVmIGZvciBiaW4gKGRlZmF1bHQ9J19zdGFydCcpICovXG4gIGJpblN1ZmZpeD86IHN0cmluZztcbiAgLyoqIGFwcGVuZCBzdWZmaXggdG8gdGhlIGZpZWxkIHJlZiAoZ2VuZXJhbCkgKi9cbiAgc3VmZml4Pzogc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmllbGQoZmllbGREZWY6IEZpZWxkRGVmLCBvcHQ6IEZpZWxkUmVmT3B0aW9uID0ge30pIHtcbiAgY29uc3QgcHJlZml4ID0gKG9wdC5kYXR1bSA/ICdkYXR1bS4nIDogJycpICsgKG9wdC5wcmVmbiB8fCAnJyk7XG4gIGNvbnN0IHN1ZmZpeCA9IG9wdC5zdWZmaXggfHwgJyc7XG4gIGNvbnN0IGZpZWxkID0gZmllbGREZWYuZmllbGQ7XG5cbiAgaWYgKGlzQ291bnQoZmllbGREZWYpKSB7XG4gICAgcmV0dXJuIHByZWZpeCArICdjb3VudCcgKyBzdWZmaXg7XG4gIH0gZWxzZSBpZiAob3B0LmZuKSB7XG4gICAgcmV0dXJuIHByZWZpeCArIG9wdC5mbiArICdfJyArIGZpZWxkICsgc3VmZml4O1xuICB9IGVsc2UgaWYgKCFvcHQubm9mbiAmJiBmaWVsZERlZi5iaW4pIHtcbiAgICByZXR1cm4gcHJlZml4ICsgJ2Jpbl8nICsgZmllbGQgKyAob3B0LmJpblN1ZmZpeCB8fCBzdWZmaXggfHwgJ19zdGFydCcpO1xuICB9IGVsc2UgaWYgKCFvcHQubm9mbiAmJiAhb3B0Lm5vQWdncmVnYXRlICYmIGZpZWxkRGVmLmFnZ3JlZ2F0ZSkge1xuICAgIHJldHVybiBwcmVmaXggKyBmaWVsZERlZi5hZ2dyZWdhdGUgKyAnXycgKyBmaWVsZCArIHN1ZmZpeDtcbiAgfSBlbHNlIGlmICghb3B0Lm5vZm4gJiYgZmllbGREZWYudGltZVVuaXQpIHtcbiAgICByZXR1cm4gcHJlZml4ICsgZmllbGREZWYudGltZVVuaXQgKyAnXycgKyBmaWVsZCArIHN1ZmZpeDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gcHJlZml4ICsgZmllbGQ7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2lzRmllbGREaW1lbnNpb24oZmllbGREZWY6IEZpZWxkRGVmKSB7XG4gIHJldHVybiBjb250YWlucyhbTk9NSU5BTCwgT1JESU5BTF0sIGZpZWxkRGVmLnR5cGUpIHx8ICEhZmllbGREZWYuYmluIHx8XG4gICAgKGZpZWxkRGVmLnR5cGUgPT09IFRFTVBPUkFMICYmICEhZmllbGREZWYudGltZVVuaXQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEaW1lbnNpb24oZmllbGREZWY6IEZpZWxkRGVmKSB7XG4gIHJldHVybiBmaWVsZERlZiAmJiBmaWVsZERlZi5maWVsZCAmJiBfaXNGaWVsZERpbWVuc2lvbihmaWVsZERlZik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc01lYXN1cmUoZmllbGREZWY6IEZpZWxkRGVmKSB7XG4gIHJldHVybiBmaWVsZERlZiAmJiBmaWVsZERlZi5maWVsZCAmJiAhX2lzRmllbGREaW1lbnNpb24oZmllbGREZWYpO1xufVxuXG5leHBvcnQgY29uc3QgQ09VTlRfVElUTEUgPSAnTnVtYmVyIG9mIFJlY29yZHMnO1xuXG5leHBvcnQgZnVuY3Rpb24gY291bnQoKTogRmllbGREZWYge1xuICByZXR1cm4geyBmaWVsZDogJyonLCBhZ2dyZWdhdGU6IEFnZ3JlZ2F0ZU9wLkNPVU5ULCB0eXBlOiBRVUFOVElUQVRJVkUsIHRpdGxlOiBDT1VOVF9USVRMRSB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNDb3VudChmaWVsZERlZjogRmllbGREZWYpIHtcbiAgcmV0dXJuIGZpZWxkRGVmLmFnZ3JlZ2F0ZSA9PT0gQWdncmVnYXRlT3AuQ09VTlQ7XG59XG5cbi8vIEZJWE1FIHJlbW92ZSB0aGlzLCBhbmQgdGhlIGdldGJpbnMgbWV0aG9kXG4vLyBGSVhNRSB0aGlzIGRlcGVuZHMgb24gY2hhbm5lbFxuZXhwb3J0IGZ1bmN0aW9uIGNhcmRpbmFsaXR5KGZpZWxkRGVmOiBGaWVsZERlZiwgc3RhdHMsIGZpbHRlck51bGwgPSB7fSkge1xuICAvLyBGSVhNRSBuZWVkIHRvIHRha2UgZmlsdGVyIGludG8gYWNjb3VudFxuXG4gIGNvbnN0IHN0YXQgPSBzdGF0c1tmaWVsZERlZi5maWVsZF0sXG4gIHR5cGUgPSBmaWVsZERlZi50eXBlO1xuXG4gIGlmIChmaWVsZERlZi5iaW4pIHtcbiAgICAvLyBuZWVkIHRvIHJlYXNzaWduIGJpbiwgb3RoZXJ3aXNlIGNvbXBpbGF0aW9uIHdpbGwgZmFpbCBkdWUgdG8gYSBUUyBidWcuXG4gICAgY29uc3QgYmluID0gZmllbGREZWYuYmluO1xuICAgIGxldCBtYXhiaW5zID0gKHR5cGVvZiBiaW4gPT09ICdib29sZWFuJykgPyB1bmRlZmluZWQgOiBiaW4ubWF4YmlucztcbiAgICBpZiAobWF4YmlucyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBtYXhiaW5zID0gMTA7XG4gICAgfVxuXG4gICAgY29uc3QgYmlucyA9IGdldGJpbnMoc3RhdCwgbWF4Ymlucyk7XG4gICAgcmV0dXJuIChiaW5zLnN0b3AgLSBiaW5zLnN0YXJ0KSAvIGJpbnMuc3RlcDtcbiAgfVxuICBpZiAodHlwZSA9PT0gVEVNUE9SQUwpIHtcbiAgICBjb25zdCB0aW1lVW5pdCA9IGZpZWxkRGVmLnRpbWVVbml0O1xuICAgIHN3aXRjaCAodGltZVVuaXQpIHtcbiAgICAgIGNhc2UgVGltZVVuaXQuU0VDT05EUzogcmV0dXJuIDYwO1xuICAgICAgY2FzZSBUaW1lVW5pdC5NSU5VVEVTOiByZXR1cm4gNjA7XG4gICAgICBjYXNlIFRpbWVVbml0LkhPVVJTOiByZXR1cm4gMjQ7XG4gICAgICBjYXNlIFRpbWVVbml0LkRBWTogcmV0dXJuIDc7XG4gICAgICBjYXNlIFRpbWVVbml0LkRBVEU6IHJldHVybiAzMTtcbiAgICAgIGNhc2UgVGltZVVuaXQuTU9OVEg6IHJldHVybiAxMjtcbiAgICAgIGNhc2UgVGltZVVuaXQuWUVBUjpcbiAgICAgICAgY29uc3QgeWVhcnN0YXQgPSBzdGF0c1sneWVhcl8nICsgZmllbGREZWYuZmllbGRdO1xuXG4gICAgICAgIGlmICgheWVhcnN0YXQpIHsgcmV0dXJuIG51bGw7IH1cblxuICAgICAgICByZXR1cm4geWVhcnN0YXQuZGlzdGluY3QgLVxuICAgICAgICAgIChzdGF0Lm1pc3NpbmcgPiAwICYmIGZpbHRlck51bGxbdHlwZV0gPyAxIDogMCk7XG4gICAgfVxuICAgIC8vIG90aGVyd2lzZSB1c2UgY2FsY3VsYXRpb24gYmVsb3dcbiAgfVxuICBpZiAoZmllbGREZWYuYWdncmVnYXRlKSB7XG4gICAgcmV0dXJuIDE7XG4gIH1cblxuICAvLyByZW1vdmUgbnVsbFxuICByZXR1cm4gc3RhdC5kaXN0aW5jdCAtXG4gICAgKHN0YXQubWlzc2luZyA+IDAgJiYgZmlsdGVyTnVsbFt0eXBlXSA/IDEgOiAwKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRpdGxlKGZpZWxkRGVmOiBGaWVsZERlZikge1xuICBpZiAoZmllbGREZWYudGl0bGUgIT0gbnVsbCkge1xuICAgIHJldHVybiBmaWVsZERlZi50aXRsZTtcbiAgfVxuICBpZiAoaXNDb3VudChmaWVsZERlZikpIHtcbiAgICByZXR1cm4gQ09VTlRfVElUTEU7XG4gIH1cbiAgY29uc3QgZm4gPSBmaWVsZERlZi5hZ2dyZWdhdGUgfHwgZmllbGREZWYudGltZVVuaXQgfHwgKGZpZWxkRGVmLmJpbiAmJiAnYmluJyk7XG4gIGlmIChmbikge1xuICAgIHJldHVybiBmbi50b1N0cmluZygpLnRvVXBwZXJDYXNlKCkgKyAnKCcgKyBmaWVsZERlZi5maWVsZCArICcpJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmllbGREZWYuZmllbGQ7XG4gIH1cbn1cbiIsImV4cG9ydCBpbnRlcmZhY2UgTGVnZW5kQ29uZmlnIHtcbiAgLyoqXG4gICAqIFRoZSBvcmllbnRhdGlvbiBvZiB0aGUgbGVnZW5kLiBPbmUgb2YgXCJsZWZ0XCIgb3IgXCJyaWdodFwiLiBUaGlzIGRldGVybWluZXMgaG93IHRoZSBsZWdlbmQgaXMgcG9zaXRpb25lZCB3aXRoaW4gdGhlIHNjZW5lLiBUaGUgZGVmYXVsdCBpcyBcInJpZ2h0XCIuXG4gICAqL1xuICBvcmllbnQ/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBUaGUgb2Zmc2V0LCBpbiBwaXhlbHMsIGJ5IHdoaWNoIHRvIGRpc3BsYWNlIHRoZSBsZWdlbmQgZnJvbSB0aGUgZWRnZSBvZiB0aGUgZW5jbG9zaW5nIGdyb3VwIG9yIGRhdGEgcmVjdGFuZ2xlLlxuICAgKi9cbiAgb2Zmc2V0PzogbnVtYmVyO1xuICAvKipcbiAgICogVGhlIHBhZGRpbmcsIGluIHBpeGVscywgYmV0d2VlbiB0aGUgbGVuZ2VuZCBhbmQgYXhpcy5cbiAgICovXG4gIHBhZGRpbmc/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBUaGUgbWFyZ2luIGFyb3VuZCB0aGUgbGVnZW5kLCBpbiBwaXhlbHNcbiAgICovXG4gIG1hcmdpbj86IG51bWJlcjtcbiAgLyoqXG4gICAqIFRoZSBjb2xvciBvZiB0aGUgZ3JhZGllbnQgc3Ryb2tlLCBjYW4gYmUgaW4gaGV4IGNvbG9yIGNvZGUgb3IgcmVndWxhciBjb2xvciBuYW1lLlxuICAgKi9cbiAgZ3JhZGllbnRTdHJva2VDb2xvcj86IHN0cmluZztcbiAgLyoqXG4gICAqIFRoZSB3aWR0aCBvZiB0aGUgZ3JhZGllbnQgc3Ryb2tlLCBpbiBwaXhlbHMuXG4gICAqL1xuICBncmFkaWVudFN0cm9rZVdpZHRoPzogbnVtYmVyO1xuICAvKipcbiAgICogVGhlIGhlaWdodCBvZiB0aGUgZ3JhZGllbnQsIGluIHBpeGVscy5cbiAgICovXG4gIGdyYWRpZW50SGVpZ2h0PzogbnVtYmVyO1xuICAvKipcbiAgICogVGhlIHdpZHRoIG9mIHRoZSBncmFkaWVudCwgaW4gcGl4ZWxzLlxuICAgKi9cbiAgZ3JhZGllbnRXaWR0aD86IG51bWJlcjtcbiAgLyoqXG4gICAqIFRoZSBhbGlnbm1lbnQgb2YgdGhlIGxlZ2VuZCBsYWJlbCwgY2FuIGJlIGxlZnQsIG1pZGRsZSBvciByaWdodC5cbiAgICovXG4gIGxhYmVsQWxpZ24/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBUaGUgcG9zaXRpb24gb2YgdGhlIGJhc2VsaW5lIG9mIGxlZ2VuZCBsYWJlbCwgY2FuIGJlIHRvcCwgbWlkZGxlIG9yIGJvdHRvbS5cbiAgICovXG4gIGxhYmVsQmFzZWxpbmU/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBUaGUgY29sb3Igb2YgdGhlIGxlZ2VuZCBsYWJlbCwgY2FuIGJlIGluIGhleCBjb2xvciBjb2RlIG9yIHJlZ3VsYXIgY29sb3IgbmFtZS5cbiAgICovXG4gIGxhYmVsQ29sb3I/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBUaGUgZm9udCBvZiB0aGUgbGVuZ2VuZCBsYWJlbC5cbiAgICovXG4gIGxhYmVsRm9udD86IHN0cmluZztcbiAgLyoqXG4gICAqIFRoZSBmb250IHNpemUgb2YgbGVuZ2VuZCBsYWJsZS5cbiAgICovXG4gIGxhYmVsRm9udFNpemU/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBUaGUgb2Zmc2V0IG9mIHRoZSBsZWdlbmQgbGFiZWwuXG4gICAqL1xuICBsYWJlbE9mZnNldD86IG51bWJlcjtcbiAgLyoqXG4gICAqIFdoZXRoZXIgbW9udGggbmFtZXMgYW5kIHdlZWtkYXkgbmFtZXMgc2hvdWxkIGJlIGFiYnJldmlhdGVkLlxuICAgKi9cbiAgc2hvcnRUaW1lTGFiZWxzPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIFRoZSBjb2xvciBvZiB0aGUgbGVnZW5kIHN5bWJvbCxcbiAgICovXG4gIHN5bWJvbENvbG9yPzogc3RyaW5nO1xuICAvKipcbiAgICogVGhlIHNoYXBlIG9mIHRoZSBsZWdlbmQgc3ltYm9sLCBjYW4gYmUgdGhlICdjaXJjbGUnLCAnc3F1YXJlJywgJ2Nyb3NzJywgJ2RpYW1vbmQnLFxuICAgKiAndHJpYW5nbGUtdXAnLCAndHJpYW5nbGUtZG93bicuXG4gICAqL1xuICBzeW1ib2xTaGFwZT86IHN0cmluZztcbiAgLyoqXG4gICAqIFRoZSBzaXplIG9mIHRoZSBsZW5nZW5kIHN5bWJvbCwgaW4gcGl4ZWxzLlxuICAgKi9cbiAgc3ltYm9sU2l6ZT86IG51bWJlcjtcbiAgLyoqXG4gICAqIFRoZSB3aWR0aCBvZiB0aGUgc3ltYm9sJ3Mgc3Ryb2tlLlxuICAgKi9cbiAgc3ltYm9sU3Ryb2tlV2lkdGg/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBPcHRpb25hbCBtYXJrIHByb3BlcnR5IGRlZmluaXRpb25zIGZvciBjdXN0b20gbGVnZW5kIHN0eWxpbmcuXG4gICAqL1xuICAvKipcbiAgICogVGhlIGNvbG9yIG9mIHRoZSBsZWdlbmQgdGl0bGUsIGNhbiBiZSBpbiBoZXggY29sb3IgY29kZSBvciByZWd1bGFyIGNvbG9yIG5hbWUuXG4gICAqL1xuICB0aXRsZUNvbG9yPzogc3RyaW5nO1xuICAvKipcbiAgICogVGhlIGZvbnQgb2YgdGhlIGxlZ2VuZCB0aXRsZS5cbiAgICovXG4gIHRpdGxlRm9udD86IHN0cmluZztcbiAgLyoqXG4gICAqIFRoZSBmb250IHNpemUgb2YgdGhlIGxlZ2VuZCB0aXRsZS5cbiAgICovXG4gIHRpdGxlRm9udFNpemU/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBUaGUgZm9udCB3ZWlnaHQgb2YgdGhlIGxlZ2VuZCB0aXRsZS5cbiAgICovXG4gIHRpdGxlRm9udFdlaWdodD86IHN0cmluZztcbiAgLyoqXG4gICAqIE9wdGlvbmFsIG1hcmsgcHJvcGVydHkgZGVmaW5pdGlvbnMgZm9yIGN1c3RvbSBsZWdlbmQgc3R5bGluZy5cbiAgICovXG4gIHByb3BlcnRpZXM/OiBhbnk7IC8vIFRPRE8oIzk3NSkgcmVwbGFjZSB3aXRoIGNvbmZpZyBwcm9wZXJ0aWVzXG59XG5cbi8qKlxuICogUHJvcGVydGllcyBvZiBhIGxlZ2VuZCBvciBib29sZWFuIGZsYWcgZm9yIGRldGVybWluaW5nIHdoZXRoZXIgdG8gc2hvdyBpdC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBMZWdlbmQgZXh0ZW5kcyBMZWdlbmRDb25maWcge1xuICAvKipcbiAgICogQW4gb3B0aW9uYWwgZm9ybWF0dGluZyBwYXR0ZXJuIGZvciBsZWdlbmQgbGFiZWxzLiBWZWdhIHVzZXMgRDNcXCdzIGZvcm1hdCBwYXR0ZXJuLlxuICAgKi9cbiAgZm9ybWF0Pzogc3RyaW5nO1xuICAvKipcbiAgICogQSB0aXRsZSBmb3IgdGhlIGxlZ2VuZC4gKFNob3dzIGZpZWxkIG5hbWUgYW5kIGl0cyBmdW5jdGlvbiBieSBkZWZhdWx0LilcbiAgICovXG4gIHRpdGxlPzogc3RyaW5nO1xuICAvKipcbiAgICogRXhwbGljaXRseSBzZXQgdGhlIHZpc2libGUgbGVnZW5kIHZhbHVlcy5cbiAgICovXG4gIHZhbHVlcz86IEFycmF5PGFueT47XG59XG5cbmV4cG9ydCBjb25zdCBkZWZhdWx0TGVnZW5kQ29uZmlnOiBMZWdlbmRDb25maWcgPSB7XG4gIG9yaWVudDogdW5kZWZpbmVkLCAvLyBpbXBsaWNpdGx5IFwicmlnaHRcIlxuICBzaG9ydFRpbWVMYWJlbHM6IGZhbHNlXG59O1xuIiwiZXhwb3J0IGVudW0gTWFyayB7XG4gIEFSRUEgPSAnYXJlYScgYXMgYW55LFxuICBCQVIgPSAnYmFyJyBhcyBhbnksXG4gIExJTkUgPSAnbGluZScgYXMgYW55LFxuICBQT0lOVCA9ICdwb2ludCcgYXMgYW55LFxuICBURVhUID0gJ3RleHQnIGFzIGFueSxcbiAgVElDSyA9ICd0aWNrJyBhcyBhbnksXG4gIFJVTEUgPSAncnVsZScgYXMgYW55LFxuICBDSVJDTEUgPSAnY2lyY2xlJyBhcyBhbnksXG4gIFNRVUFSRSA9ICdzcXVhcmUnIGFzIGFueSxcbiAgRVJST1JCQVIgPSAnZXJyb3JCYXInIGFzIGFueSxcbiAgQk9YUExPVCA9ICdib3hQbG90JyBhcyBhbnlcbn1cblxuZXhwb3J0IGNvbnN0IEFSRUEgPSBNYXJrLkFSRUE7XG5leHBvcnQgY29uc3QgQkFSID0gTWFyay5CQVI7XG5leHBvcnQgY29uc3QgTElORSA9IE1hcmsuTElORTtcbmV4cG9ydCBjb25zdCBQT0lOVCA9IE1hcmsuUE9JTlQ7XG5leHBvcnQgY29uc3QgVEVYVCA9IE1hcmsuVEVYVDtcbmV4cG9ydCBjb25zdCBUSUNLID0gTWFyay5USUNLO1xuZXhwb3J0IGNvbnN0IFJVTEUgPSBNYXJrLlJVTEU7XG5cbmV4cG9ydCBjb25zdCBDSVJDTEUgPSBNYXJrLkNJUkNMRTtcbmV4cG9ydCBjb25zdCBTUVVBUkUgPSBNYXJrLlNRVUFSRTtcblxuZXhwb3J0IGNvbnN0IEVSUk9SQkFSID0gTWFyay5FUlJPUkJBUjtcbmV4cG9ydCBjb25zdCBCT1hQTE9UID0gTWFyay5CT1hQTE9UO1xuIiwiZXhwb3J0IGVudW0gU2NhbGVUeXBlIHtcbiAgICBMSU5FQVIgPSAnbGluZWFyJyBhcyBhbnksXG4gICAgTE9HID0gJ2xvZycgYXMgYW55LFxuICAgIFBPVyA9ICdwb3cnIGFzIGFueSxcbiAgICBTUVJUID0gJ3NxcnQnIGFzIGFueSxcbiAgICBRVUFOVElMRSA9ICdxdWFudGlsZScgYXMgYW55LFxuICAgIFFVQU5USVpFID0gJ3F1YW50aXplJyBhcyBhbnksXG4gICAgT1JESU5BTCA9ICdvcmRpbmFsJyBhcyBhbnksXG4gICAgVElNRSA9ICd0aW1lJyBhcyBhbnksXG4gICAgVVRDICA9ICd1dGMnIGFzIGFueSxcbn1cblxuZXhwb3J0IGVudW0gTmljZVRpbWUge1xuICAgIFNFQ09ORCA9ICdzZWNvbmQnIGFzIGFueSxcbiAgICBNSU5VVEUgPSAnbWludXRlJyBhcyBhbnksXG4gICAgSE9VUiA9ICdob3VyJyBhcyBhbnksXG4gICAgREFZID0gJ2RheScgYXMgYW55LFxuICAgIFdFRUsgPSAnd2VlaycgYXMgYW55LFxuICAgIE1PTlRIID0gJ21vbnRoJyBhcyBhbnksXG4gICAgWUVBUiA9ICd5ZWFyJyBhcyBhbnksXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2NhbGVDb25maWcge1xuICAvKipcbiAgICogSWYgdHJ1ZSwgcm91bmRzIG51bWVyaWMgb3V0cHV0IHZhbHVlcyB0byBpbnRlZ2Vycy5cbiAgICogVGhpcyBjYW4gYmUgaGVscGZ1bCBmb3Igc25hcHBpbmcgdG8gdGhlIHBpeGVsIGdyaWQuXG4gICAqIChPbmx5IGF2YWlsYWJsZSBmb3IgYHhgLCBgeWAsIGBzaXplYCwgYHJvd2AsIGFuZCBgY29sdW1uYCBzY2FsZXMuKVxuICAgKi9cbiAgcm91bmQ/OiBib29sZWFuO1xuICAvKipcbiAgICogIERlZmF1bHQgYmFuZCB3aWR0aCBmb3IgYHhgIG9yZGluYWwgc2NhbGUgd2hlbiBpcyBtYXJrIGlzIGB0ZXh0YC5cbiAgICogIEBtaW5pbXVtIDBcbiAgICovXG4gIHRleHRCYW5kV2lkdGg/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBEZWZhdWx0IGJhbmQgc2l6ZSBmb3IgKDEpIGB5YCBvcmRpbmFsIHNjYWxlLFxuICAgKiBhbmQgKDIpIGB4YCBvcmRpbmFsIHNjYWxlIHdoZW4gdGhlIG1hcmsgaXMgbm90IGB0ZXh0YC5cbiAgICogQG1pbmltdW0gMFxuICAgKi9cbiAgYmFuZFNpemU/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBEZWZhdWx0IHJhbmdlIGZvciBvcGFjaXR5LlxuICAgKi9cbiAgb3BhY2l0eT86IG51bWJlcltdO1xuICAvKipcbiAgICogRGVmYXVsdCBwYWRkaW5nIGZvciBgeGAgYW5kIGB5YCBvcmRpbmFsIHNjYWxlcy5cbiAgICovXG4gIHBhZGRpbmc/OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFVzZXMgdGhlIHNvdXJjZSBkYXRhIHJhbmdlIGFzIHNjYWxlIGRvbWFpbiBpbnN0ZWFkIG9mIGFnZ3JlZ2F0ZWQgZGF0YSBmb3IgYWdncmVnYXRlIGF4aXMuXG4gICAqIFRoaXMgcHJvcGVydHkgb25seSB3b3JrcyB3aXRoIGFnZ3JlZ2F0ZSBmdW5jdGlvbnMgdGhhdCBwcm9kdWNlIHZhbHVlcyB3aXRoaW4gdGhlIHJhdyBkYXRhIGRvbWFpbiAoYFwibWVhblwiYCwgYFwiYXZlcmFnZVwiYCwgYFwic3RkZXZcImAsIGBcInN0ZGV2cFwiYCwgYFwibWVkaWFuXCJgLCBgXCJxMVwiYCwgYFwicTNcImAsIGBcIm1pblwiYCwgYFwibWF4XCJgKS4gRm9yIG90aGVyIGFnZ3JlZ2F0aW9ucyB0aGF0IHByb2R1Y2UgdmFsdWVzIG91dHNpZGUgb2YgdGhlIHJhdyBkYXRhIGRvbWFpbiAoZS5nLiBgXCJjb3VudFwiYCwgYFwic3VtXCJgKSwgdGhpcyBwcm9wZXJ0eSBpcyBpZ25vcmVkLlxuICAgKi9cbiAgdXNlUmF3RG9tYWluPzogYm9vbGVhbjtcblxuICAvKiogRGVmYXVsdCByYW5nZSBmb3Igbm9taW5hbCBjb2xvciBzY2FsZSAqL1xuICBub21pbmFsQ29sb3JSYW5nZT86IHN0cmluZyB8IHN0cmluZ1tdO1xuICAvKiogRGVmYXVsdCByYW5nZSBmb3Igb3JkaW5hbCAvIGNvbnRpbnVvdXMgY29sb3Igc2NhbGUgKi9cbiAgc2VxdWVudGlhbENvbG9yUmFuZ2U/OiBzdHJpbmcgfCBzdHJpbmdbXTtcbiAgLyoqIERlZmF1bHQgcmFuZ2UgZm9yIHNoYXBlICovXG4gIHNoYXBlUmFuZ2U/OiBzdHJpbmd8c3RyaW5nW107XG5cbiAgLyoqIERlZmF1bHQgcmFuZ2UgZm9yIGJhciBzaXplIHNjYWxlICovXG4gIGJhclNpemVSYW5nZT86IG51bWJlcltdO1xuXG4gIC8qKiBEZWZhdWx0IHJhbmdlIGZvciBmb250IHNpemUgc2NhbGUgKi9cbiAgZm9udFNpemVSYW5nZT86IG51bWJlcltdO1xuXG4gIC8qKiBEZWZhdWx0IHJhbmdlIGZvciBydWxlIHN0cm9rZSB3aWR0aHMgKi9cbiAgcnVsZVNpemVSYW5nZT86IG51bWJlcltdO1xuXG4gIC8qKiBEZWZhdWx0IHJhbmdlIGZvciB0aWNrIHNwYW5zICovXG4gIHRpY2tTaXplUmFuZ2U/OiBudW1iZXJbXTtcblxuICAvKiogRGVmYXVsdCByYW5nZSBmb3IgYmFyIHNpemUgc2NhbGUgKi9cbiAgcG9pbnRTaXplUmFuZ2U/OiBudW1iZXJbXTtcblxuICAvLyBuaWNlIHNob3VsZCBkZXBlbmRzIG9uIHR5cGUgKHF1YW50aXRhdGl2ZSBvciB0ZW1wb3JhbCksIHNvXG4gIC8vIGxldCdzIG5vdCBtYWtlIGEgY29uZmlnLlxufVxuXG5leHBvcnQgY29uc3QgZGVmYXVsdFNjYWxlQ29uZmlnOiBTY2FsZUNvbmZpZyA9IHtcbiAgcm91bmQ6IHRydWUsXG4gIHRleHRCYW5kV2lkdGg6IDkwLFxuICBiYW5kU2l6ZTogMjEsXG4gIHBhZGRpbmc6IDEsXG4gIHVzZVJhd0RvbWFpbjogZmFsc2UsXG4gIG9wYWNpdHk6IFswLjMsIDAuOF0sXG5cbiAgbm9taW5hbENvbG9yUmFuZ2U6ICdjYXRlZ29yeTEwJyxcbiAgc2VxdWVudGlhbENvbG9yUmFuZ2U6IFsnI0FGQzZBMycsICcjMDk2MjJBJ10sIC8vIHRhYmxlYXUgZ3JlZW5zXG4gIHNoYXBlUmFuZ2U6ICdzaGFwZXMnLFxuICBmb250U2l6ZVJhbmdlOiBbOCwgNDBdLFxuICBydWxlU2l6ZVJhbmdlOiBbMSwgNV0sXG4gIHRpY2tTaXplUmFuZ2U6IFsxLCAyMF1cbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgRmFjZXRTY2FsZUNvbmZpZyB7XG4gIHJvdW5kPzogYm9vbGVhbjtcbiAgcGFkZGluZz86IG51bWJlcjtcbn1cblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRGYWNldFNjYWxlQ29uZmlnOiBGYWNldFNjYWxlQ29uZmlnID0ge1xuICByb3VuZDogdHJ1ZSxcbiAgcGFkZGluZzogMTZcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2NhbGUge1xuICB0eXBlPzogU2NhbGVUeXBlO1xuICAvKipcbiAgICogVGhlIGRvbWFpbiBvZiB0aGUgc2NhbGUsIHJlcHJlc2VudGluZyB0aGUgc2V0IG9mIGRhdGEgdmFsdWVzLiBGb3IgcXVhbnRpdGF0aXZlIGRhdGEsIHRoaXMgY2FuIHRha2UgdGhlIGZvcm0gb2YgYSB0d28tZWxlbWVudCBhcnJheSB3aXRoIG1pbmltdW0gYW5kIG1heGltdW0gdmFsdWVzLiBGb3Igb3JkaW5hbC9jYXRlZ29yaWNhbCBkYXRhLCB0aGlzIG1heSBiZSBhbiBhcnJheSBvZiB2YWxpZCBpbnB1dCB2YWx1ZXMuIFRoZSBkb21haW4gbWF5IGFsc28gYmUgc3BlY2lmaWVkIGJ5IGEgcmVmZXJlbmNlIHRvIGEgZGF0YSBzb3VyY2UuXG4gICAqL1xuICBkb21haW4/OiBzdHJpbmcgfCBudW1iZXJbXSB8IHN0cmluZ1tdOyAvLyBUT0RPOiBkZWNsYXJlIHZnRGF0YURvbWFpblxuICAvKipcbiAgICogVGhlIHJhbmdlIG9mIHRoZSBzY2FsZSwgcmVwcmVzZW50aW5nIHRoZSBzZXQgb2YgdmlzdWFsIHZhbHVlcy4gRm9yIG51bWVyaWMgdmFsdWVzLCB0aGUgcmFuZ2UgY2FuIHRha2UgdGhlIGZvcm0gb2YgYSB0d28tZWxlbWVudCBhcnJheSB3aXRoIG1pbmltdW0gYW5kIG1heGltdW0gdmFsdWVzLiBGb3Igb3JkaW5hbCBvciBxdWFudGl6ZWQgZGF0YSwgdGhlIHJhbmdlIG1heSBieSBhbiBhcnJheSBvZiBkZXNpcmVkIG91dHB1dCB2YWx1ZXMsIHdoaWNoIGFyZSBtYXBwZWQgdG8gZWxlbWVudHMgaW4gdGhlIHNwZWNpZmllZCBkb21haW4uIEZvciBvcmRpbmFsIHNjYWxlcyBvbmx5LCB0aGUgcmFuZ2UgY2FuIGJlIGRlZmluZWQgdXNpbmcgYSBEYXRhUmVmOiB0aGUgcmFuZ2UgdmFsdWVzIGFyZSB0aGVuIGRyYXduIGR5bmFtaWNhbGx5IGZyb20gYSBiYWNraW5nIGRhdGEgc2V0LlxuICAgKi9cbiAgcmFuZ2U/OiBzdHJpbmcgfCBudW1iZXJbXSB8IHN0cmluZ1tdOyAvLyBUT0RPOiBkZWNsYXJlIHZnUmFuZ2VEb21haW5cbiAgLyoqXG4gICAqIElmIHRydWUsIHJvdW5kcyBudW1lcmljIG91dHB1dCB2YWx1ZXMgdG8gaW50ZWdlcnMuIFRoaXMgY2FuIGJlIGhlbHBmdWwgZm9yIHNuYXBwaW5nIHRvIHRoZSBwaXhlbCBncmlkLlxuICAgKi9cbiAgcm91bmQ/OiBib29sZWFuO1xuXG4gIC8vIG9yZGluYWxcbiAgLyoqXG4gICAqIEBtaW5pbXVtIDBcbiAgICovXG4gIGJhbmRTaXplPzogbnVtYmVyO1xuICAvKipcbiAgICogQXBwbGllcyBzcGFjaW5nIGFtb25nIG9yZGluYWwgZWxlbWVudHMgaW4gdGhlIHNjYWxlIHJhbmdlLiBUaGUgYWN0dWFsIGVmZmVjdCBkZXBlbmRzIG9uIGhvdyB0aGUgc2NhbGUgaXMgY29uZmlndXJlZC4gSWYgdGhlIF9fcG9pbnRzX18gcGFyYW1ldGVyIGlzIGB0cnVlYCwgdGhlIHBhZGRpbmcgdmFsdWUgaXMgaW50ZXJwcmV0ZWQgYXMgYSBtdWx0aXBsZSBvZiB0aGUgc3BhY2luZyBiZXR3ZWVuIHBvaW50cy4gQSByZWFzb25hYmxlIHZhbHVlIGlzIDEuMCwgc3VjaCB0aGF0IHRoZSBmaXJzdCBhbmQgbGFzdCBwb2ludCB3aWxsIGJlIG9mZnNldCBmcm9tIHRoZSBtaW5pbXVtIGFuZCBtYXhpbXVtIHZhbHVlIGJ5IGhhbGYgdGhlIGRpc3RhbmNlIGJldHdlZW4gcG9pbnRzLiBPdGhlcndpc2UsIHBhZGRpbmcgaXMgdHlwaWNhbGx5IGluIHRoZSByYW5nZSBbMCwgMV0gYW5kIGNvcnJlc3BvbmRzIHRvIHRoZSBmcmFjdGlvbiBvZiBzcGFjZSBpbiB0aGUgcmFuZ2UgaW50ZXJ2YWwgdG8gYWxsb2NhdGUgdG8gcGFkZGluZy4gQSB2YWx1ZSBvZiAwLjUgbWVhbnMgdGhhdCB0aGUgcmFuZ2UgYmFuZCB3aWR0aCB3aWxsIGJlIGVxdWFsIHRvIHRoZSBwYWRkaW5nIHdpZHRoLiBGb3IgbW9yZSwgc2VlIHRoZSBbRDMgb3JkaW5hbCBzY2FsZSBkb2N1bWVudGF0aW9uXShodHRwczovL2dpdGh1Yi5jb20vbWJvc3RvY2svZDMvd2lraS9PcmRpbmFsLVNjYWxlcykuXG4gICAqL1xuICBwYWRkaW5nPzogbnVtYmVyO1xuXG4gIC8vIHR5cGljYWxcbiAgLyoqXG4gICAqIElmIHRydWUsIHZhbHVlcyB0aGF0IGV4Y2VlZCB0aGUgZGF0YSBkb21haW4gYXJlIGNsYW1wZWQgdG8gZWl0aGVyIHRoZSBtaW5pbXVtIG9yIG1heGltdW0gcmFuZ2UgdmFsdWVcbiAgICovXG4gIGNsYW1wPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIElmIHNwZWNpZmllZCwgbW9kaWZpZXMgdGhlIHNjYWxlIGRvbWFpbiB0byB1c2UgYSBtb3JlIGh1bWFuLWZyaWVuZGx5IHZhbHVlIHJhbmdlLiBJZiBzcGVjaWZpZWQgYXMgYSB0cnVlIGJvb2xlYW4sIG1vZGlmaWVzIHRoZSBzY2FsZSBkb21haW4gdG8gdXNlIGEgbW9yZSBodW1hbi1mcmllbmRseSBudW1iZXIgcmFuZ2UgKGUuZy4sIDcgaW5zdGVhZCBvZiA2Ljk2KS4gSWYgc3BlY2lmaWVkIGFzIGEgc3RyaW5nLCBtb2RpZmllcyB0aGUgc2NhbGUgZG9tYWluIHRvIHVzZSBhIG1vcmUgaHVtYW4tZnJpZW5kbHkgdmFsdWUgcmFuZ2UuIEZvciB0aW1lIGFuZCB1dGMgc2NhbGUgdHlwZXMgb25seSwgdGhlIG5pY2UgdmFsdWUgc2hvdWxkIGJlIGEgc3RyaW5nIGluZGljYXRpbmcgdGhlIGRlc2lyZWQgdGltZSBpbnRlcnZhbC5cbiAgICovXG4gIG5pY2U/OiBib29sZWFuIHwgTmljZVRpbWU7XG4gIC8qKlxuICAgKiBTZXRzIHRoZSBleHBvbmVudCBvZiB0aGUgc2NhbGUgdHJhbnNmb3JtYXRpb24uIEZvciBwb3cgc2NhbGUgdHlwZXMgb25seSwgb3RoZXJ3aXNlIGlnbm9yZWQuXG4gICAqL1xuICBleHBvbmVudD86IG51bWJlcjtcbiAgLyoqXG4gICAqIElmIHRydWUsIGVuc3VyZXMgdGhhdCBhIHplcm8gYmFzZWxpbmUgdmFsdWUgaXMgaW5jbHVkZWQgaW4gdGhlIHNjYWxlIGRvbWFpbi4gVGhpcyBvcHRpb24gaXMgaWdub3JlZCBmb3Igbm9uLXF1YW50aXRhdGl2ZSBzY2FsZXMuXG4gICAqL1xuICB6ZXJvPzogYm9vbGVhbjtcblxuICAvLyBWZWdhLUxpdGUgb25seVxuICAvKipcbiAgICogVXNlcyB0aGUgc291cmNlIGRhdGEgcmFuZ2UgYXMgc2NhbGUgZG9tYWluIGluc3RlYWQgb2YgYWdncmVnYXRlZCBkYXRhIGZvciBhZ2dyZWdhdGUgYXhpcy5cbiAgICogVGhpcyBwcm9wZXJ0eSBvbmx5IHdvcmtzIHdpdGggYWdncmVnYXRlIGZ1bmN0aW9ucyB0aGF0IHByb2R1Y2UgdmFsdWVzIHdpdGhpbiB0aGUgcmF3IGRhdGEgZG9tYWluIChgXCJtZWFuXCJgLCBgXCJhdmVyYWdlXCJgLCBgXCJzdGRldlwiYCwgYFwic3RkZXZwXCJgLCBgXCJtZWRpYW5cImAsIGBcInExXCJgLCBgXCJxM1wiYCwgYFwibWluXCJgLCBgXCJtYXhcImApLiBGb3Igb3RoZXIgYWdncmVnYXRpb25zIHRoYXQgcHJvZHVjZSB2YWx1ZXMgb3V0c2lkZSBvZiB0aGUgcmF3IGRhdGEgZG9tYWluIChlLmcuIGBcImNvdW50XCJgLCBgXCJzdW1cImApLCB0aGlzIHByb3BlcnR5IGlzIGlnbm9yZWQuXG4gICAqL1xuICB1c2VSYXdEb21haW4/OiBib29sZWFuO1xufVxuIiwiLyoqIG1vZHVsZSBmb3Igc2hvcnRoYW5kICovXG5cbmltcG9ydCB7RW5jb2Rpbmd9IGZyb20gJy4vZW5jb2RpbmcnO1xuaW1wb3J0IHtGaWVsZERlZn0gZnJvbSAnLi9maWVsZGRlZic7XG5pbXBvcnQge0V4dGVuZGVkVW5pdFNwZWN9IGZyb20gJy4vc3BlYyc7XG5cbmltcG9ydCB7QWdncmVnYXRlT3AsIEFHR1JFR0FURV9PUFN9IGZyb20gJy4vYWdncmVnYXRlJztcbmltcG9ydCB7VElNRVVOSVRTfSBmcm9tICcuL3RpbWV1bml0JztcbmltcG9ydCB7U0hPUlRfVFlQRSwgVFlQRV9GUk9NX1NIT1JUX1RZUEV9IGZyb20gJy4vdHlwZSc7XG5pbXBvcnQgKiBhcyB2bEVuY29kaW5nIGZyb20gJy4vZW5jb2RpbmcnO1xuaW1wb3J0IHtNYXJrfSBmcm9tICcuL21hcmsnO1xuXG5leHBvcnQgY29uc3QgREVMSU0gPSAnfCc7XG5leHBvcnQgY29uc3QgQVNTSUdOID0gJz0nO1xuZXhwb3J0IGNvbnN0IFRZUEUgPSAnLCc7XG5leHBvcnQgY29uc3QgRlVOQyA9ICdfJztcblxuXG5leHBvcnQgZnVuY3Rpb24gc2hvcnRlbihzcGVjOiBFeHRlbmRlZFVuaXRTcGVjKTogc3RyaW5nIHtcbiAgcmV0dXJuICdtYXJrJyArIEFTU0lHTiArIHNwZWMubWFyayArXG4gICAgREVMSU0gKyBzaG9ydGVuRW5jb2Rpbmcoc3BlYy5lbmNvZGluZyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZShzaG9ydGhhbmQ6IHN0cmluZywgZGF0YT8sIGNvbmZpZz8pIHtcbiAgbGV0IHNwbGl0ID0gc2hvcnRoYW5kLnNwbGl0KERFTElNKSxcbiAgICBtYXJrID0gc3BsaXQuc2hpZnQoKS5zcGxpdChBU1NJR04pWzFdLnRyaW0oKSxcbiAgICBlbmNvZGluZyA9IHBhcnNlRW5jb2Rpbmcoc3BsaXQuam9pbihERUxJTSkpO1xuXG4gIGxldCBzcGVjOkV4dGVuZGVkVW5pdFNwZWMgPSB7XG4gICAgbWFyazogTWFya1ttYXJrXSxcbiAgICBlbmNvZGluZzogZW5jb2RpbmdcbiAgfTtcblxuICBpZiAoZGF0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgc3BlYy5kYXRhID0gZGF0YTtcbiAgfVxuICBpZiAoY29uZmlnICE9PSB1bmRlZmluZWQpIHtcbiAgICBzcGVjLmNvbmZpZyA9IGNvbmZpZztcbiAgfVxuICByZXR1cm4gc3BlYztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3J0ZW5FbmNvZGluZyhlbmNvZGluZzogRW5jb2RpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gdmxFbmNvZGluZy5tYXAoZW5jb2RpbmcsIGZ1bmN0aW9uKGZpZWxkRGVmLCBjaGFubmVsKSB7XG4gICAgcmV0dXJuIGNoYW5uZWwgKyBBU1NJR04gKyBzaG9ydGVuRmllbGREZWYoZmllbGREZWYpO1xuICB9KS5qb2luKERFTElNKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRW5jb2RpbmcoZW5jb2RpbmdTaG9ydGhhbmQ6IHN0cmluZyk6IEVuY29kaW5nIHtcbiAgcmV0dXJuIGVuY29kaW5nU2hvcnRoYW5kLnNwbGl0KERFTElNKS5yZWR1Y2UoZnVuY3Rpb24obSwgZSkge1xuICAgIGNvbnN0IHNwbGl0ID0gZS5zcGxpdChBU1NJR04pLFxuICAgICAgICBlbmN0eXBlID0gc3BsaXRbMF0udHJpbSgpLFxuICAgICAgICBmaWVsZERlZlNob3J0aGFuZCA9IHNwbGl0WzFdO1xuXG4gICAgbVtlbmN0eXBlXSA9IHBhcnNlRmllbGREZWYoZmllbGREZWZTaG9ydGhhbmQpO1xuICAgIHJldHVybiBtO1xuICB9LCB7fSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG9ydGVuRmllbGREZWYoZmllbGREZWY6IEZpZWxkRGVmKTogc3RyaW5nIHtcbiAgcmV0dXJuIChmaWVsZERlZi5hZ2dyZWdhdGUgPyBmaWVsZERlZi5hZ2dyZWdhdGUgKyBGVU5DIDogJycpICtcbiAgICAoZmllbGREZWYudGltZVVuaXQgPyBmaWVsZERlZi50aW1lVW5pdCArIEZVTkMgOiAnJykgK1xuICAgIChmaWVsZERlZi5iaW4gPyAnYmluJyArIEZVTkMgOiAnJykgK1xuICAgIChmaWVsZERlZi5maWVsZCB8fCAnJykgKyBUWVBFICsgU0hPUlRfVFlQRVtmaWVsZERlZi50eXBlXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3J0ZW5GaWVsZERlZnMoZmllbGREZWZzOiBGaWVsZERlZltdLCBkZWxpbSA9IERFTElNKTogc3RyaW5nIHtcbiAgcmV0dXJuIGZpZWxkRGVmcy5tYXAoc2hvcnRlbkZpZWxkRGVmKS5qb2luKGRlbGltKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRmllbGREZWYoZmllbGREZWZTaG9ydGhhbmQ6IHN0cmluZyk6IEZpZWxkRGVmIHtcbiAgY29uc3Qgc3BsaXQgPSBmaWVsZERlZlNob3J0aGFuZC5zcGxpdChUWVBFKTtcblxuICBsZXQgZmllbGREZWY6IEZpZWxkRGVmID0ge1xuICAgIGZpZWxkOiBzcGxpdFswXS50cmltKCksXG4gICAgdHlwZTogVFlQRV9GUk9NX1NIT1JUX1RZUEVbc3BsaXRbMV0udHJpbSgpXVxuICB9O1xuXG4gIC8vIGNoZWNrIGFnZ3JlZ2F0ZSB0eXBlXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgQUdHUkVHQVRFX09QUy5sZW5ndGg7IGkrKykge1xuICAgIGxldCBhID0gQUdHUkVHQVRFX09QU1tpXTtcbiAgICBpZiAoZmllbGREZWYuZmllbGQuaW5kZXhPZihhICsgJ18nKSA9PT0gMCkge1xuICAgICAgZmllbGREZWYuZmllbGQgPSBmaWVsZERlZi5maWVsZC5zdWJzdHIoYS50b1N0cmluZygpLmxlbmd0aCArIDEpO1xuICAgICAgaWYgKGEgPT09IEFnZ3JlZ2F0ZU9wLkNPVU5UICYmIGZpZWxkRGVmLmZpZWxkLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBmaWVsZERlZi5maWVsZCA9ICcqJztcbiAgICAgIH1cbiAgICAgIGZpZWxkRGVmLmFnZ3JlZ2F0ZSA9IGE7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBmb3IgKGxldCBpID0gMDsgaSA8IFRJTUVVTklUUy5sZW5ndGg7IGkrKykge1xuICAgIGxldCB0dSA9IFRJTUVVTklUU1tpXTtcbiAgICBpZiAoZmllbGREZWYuZmllbGQgJiYgZmllbGREZWYuZmllbGQuaW5kZXhPZih0dSArICdfJykgPT09IDApIHtcbiAgICAgIGZpZWxkRGVmLmZpZWxkID0gZmllbGREZWYuZmllbGQuc3Vic3RyKGZpZWxkRGVmLmZpZWxkLmxlbmd0aCArIDEpO1xuICAgICAgZmllbGREZWYudGltZVVuaXQgPSB0dTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8vIGNoZWNrIGJpblxuICBpZiAoZmllbGREZWYuZmllbGQgJiYgZmllbGREZWYuZmllbGQuaW5kZXhPZignYmluXycpID09PSAwKSB7XG4gICAgZmllbGREZWYuZmllbGQgPSBmaWVsZERlZi5maWVsZC5zdWJzdHIoNCk7XG4gICAgZmllbGREZWYuYmluID0gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmaWVsZERlZjtcbn1cbiIsImltcG9ydCB7QWdncmVnYXRlT3B9IGZyb20gJy4vYWdncmVnYXRlJztcblxuZXhwb3J0IGVudW0gU29ydE9yZGVyIHtcbiAgICBBU0NFTkRJTkcgPSAnYXNjZW5kaW5nJyBhcyBhbnksXG4gICAgREVTQ0VORElORyA9ICdkZXNjZW5kaW5nJyBhcyBhbnksXG4gICAgTk9ORSA9ICdub25lJyBhcyBhbnksXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU29ydEZpZWxkIHtcbiAgLyoqXG4gICAqIFRoZSBmaWVsZCBuYW1lIHRvIGFnZ3JlZ2F0ZSBvdmVyLlxuICAgKi9cbiAgZmllbGQ6IHN0cmluZztcbiAgLyoqXG4gICAqIFRoZSBzb3J0IGFnZ3JlZ2F0aW9uIG9wZXJhdG9yXG4gICAqL1xuICBvcDogQWdncmVnYXRlT3A7XG5cbiAgb3JkZXI/OiBTb3J0T3JkZXI7XG59XG4iLCIvKiBVdGlsaXRpZXMgZm9yIGEgVmVnYS1MaXRlIHNwZWNpZmljaWF0aW9uICovXG5cbmltcG9ydCB7RmllbGREZWZ9IGZyb20gJy4vZmllbGRkZWYnO1xuLy8gUGFja2FnZSBvZiBkZWZpbmluZyBWZWdhLWxpdGUgU3BlY2lmaWNhdGlvbidzIGpzb24gc2NoZW1hXG5cbmltcG9ydCB7Q29uZmlnfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQge0RhdGF9IGZyb20gJy4vZGF0YSc7XG5pbXBvcnQge0VuY29kaW5nLCBVbml0RW5jb2RpbmcsIGhhcywgaXNSYW5nZWR9IGZyb20gJy4vZW5jb2RpbmcnO1xuaW1wb3J0IHtGYWNldH0gZnJvbSAnLi9mYWNldCc7XG5pbXBvcnQge01hcmt9IGZyb20gJy4vbWFyayc7XG5pbXBvcnQge1RyYW5zZm9ybX0gZnJvbSAnLi90cmFuc2Zvcm0nO1xuaW1wb3J0IHtRVUFOVElUQVRJVkV9IGZyb20gJy4vdHlwZSc7XG5cbmltcG9ydCB7Q09MT1IsIFNIQVBFLCBST1csIENPTFVNTiwgWCwgWSwgWDIsIFkyfSBmcm9tICcuL2NoYW5uZWwnO1xuaW1wb3J0ICogYXMgdmxFbmNvZGluZyBmcm9tICcuL2VuY29kaW5nJztcbmltcG9ydCB7VElDSywgUlVMRSwgQkFSLCBBUkVBLCBFUlJPUkJBUiwgQk9YUExPVH0gZnJvbSAnLi9tYXJrJztcbmltcG9ydCB7ZHVwbGljYXRlLCBleHRlbmQsIGNvbnRhaW5zfSBmcm9tICcuL3V0aWwnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEJhc2VTcGVjIHtcbiAgbmFtZT86IHN0cmluZztcbiAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG4gIGRhdGE/OiBEYXRhO1xuICB0cmFuc2Zvcm0/OiBUcmFuc2Zvcm07XG4gIGNvbmZpZz86IENvbmZpZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBVbml0U3BlYyBleHRlbmRzIEJhc2VTcGVjIHtcbiAgbWFyazogTWFyaztcbiAgZW5jb2Rpbmc/OiBVbml0RW5jb2Rpbmc7XG59XG5cbi8qKlxuICogU2NoZW1hIGZvciBhIHVuaXQgVmVnYS1MaXRlIHNwZWNpZmljYXRpb24sIHdpdGggdGhlIHN5bnRhY3RpYyBzdWdhciBleHRlbnNpb25zOlxuICogLSBgcm93YCBhbmQgYGNvbHVtbmAgYXJlIGluY2x1ZGVkIGluIHRoZSBlbmNvZGluZy5cbiAqIC0gKEZ1dHVyZSkgbGFiZWwsIGJveCBwbG90XG4gKlxuICogTm90ZTogdGhlIHNwZWMgY291bGQgY29udGFpbiBmYWNldC5cbiAqXG4gKiBAcmVxdWlyZWQgW1wibWFya1wiLCBcImVuY29kaW5nXCJdXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRXh0ZW5kZWRVbml0U3BlYyBleHRlbmRzIEJhc2VTcGVjIHtcbiAgLyoqXG4gICAqIEEgbmFtZSBmb3IgdGhlIHNwZWNpZmljYXRpb24uIFRoZSBuYW1lIGlzIHVzZWQgdG8gYW5ub3RhdGUgbWFya3MsIHNjYWxlIG5hbWVzLCBhbmQgbW9yZS5cbiAgICovXG4gIG1hcms6IE1hcms7XG4gIGVuY29kaW5nPzogRW5jb2Rpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRmFjZXRTcGVjIGV4dGVuZHMgQmFzZVNwZWMge1xuICBmYWNldDogRmFjZXQ7XG4gIHNwZWM6IExheWVyU3BlYyB8IFVuaXRTcGVjO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIExheWVyU3BlYyBleHRlbmRzIEJhc2VTcGVjIHtcbiAgbGF5ZXJzOiBVbml0U3BlY1tdO1xufVxuXG4vKiogVGhpcyBpcyBmb3IgdGhlIGZ1dHVyZSBzY2hlbWEgKi9cbmV4cG9ydCBpbnRlcmZhY2UgRXh0ZW5kZWRGYWNldFNwZWMgZXh0ZW5kcyBCYXNlU3BlYyB7XG4gIGZhY2V0OiBGYWNldDtcblxuICBzcGVjOiBFeHRlbmRlZFVuaXRTcGVjIHwgRmFjZXRTcGVjO1xufVxuXG5leHBvcnQgdHlwZSBFeHRlbmRlZFNwZWMgPSBFeHRlbmRlZFVuaXRTcGVjIHwgRmFjZXRTcGVjIHwgTGF5ZXJTcGVjO1xuZXhwb3J0IHR5cGUgU3BlYyA9IFVuaXRTcGVjIHwgRmFjZXRTcGVjIHwgTGF5ZXJTcGVjO1xuXG4vKiBDdXN0b20gdHlwZSBndWFyZHMgKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRmFjZXRTcGVjKHNwZWM6IEV4dGVuZGVkU3BlYyk6IHNwZWMgaXMgRmFjZXRTcGVjIHtcbiAgcmV0dXJuIHNwZWNbJ2ZhY2V0J10gIT09IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRXh0ZW5kZWRVbml0U3BlYyhzcGVjOiBFeHRlbmRlZFNwZWMpOiBzcGVjIGlzIEV4dGVuZGVkVW5pdFNwZWMge1xuICBpZiAoaXNTb21lVW5pdFNwZWMoc3BlYykpIHtcbiAgICBjb25zdCBoYXNSb3cgPSBoYXMoc3BlYy5lbmNvZGluZywgUk9XKTtcbiAgICBjb25zdCBoYXNDb2x1bW4gPSBoYXMoc3BlYy5lbmNvZGluZywgQ09MVU1OKTtcblxuICAgIHJldHVybiBoYXNSb3cgfHwgaGFzQ29sdW1uO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNVbml0U3BlYyhzcGVjOiBFeHRlbmRlZFNwZWMpOiBzcGVjIGlzIFVuaXRTcGVjIHtcbiAgaWYgKGlzU29tZVVuaXRTcGVjKHNwZWMpKSB7XG4gICAgcmV0dXJuICFpc0V4dGVuZGVkVW5pdFNwZWMoc3BlYyk7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1NvbWVVbml0U3BlYyhzcGVjOiBFeHRlbmRlZFNwZWMpOiBzcGVjIGlzIEV4dGVuZGVkVW5pdFNwZWMgfCBVbml0U3BlYyB7XG4gIHJldHVybiBzcGVjWydtYXJrJ10gIT09IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTGF5ZXJTcGVjKHNwZWM6IEV4dGVuZGVkU3BlYyk6IHNwZWMgaXMgTGF5ZXJTcGVjIHtcbiAgcmV0dXJuIHNwZWNbJ2xheWVycyddICE9PSB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogRGVjb21wb3NlIGV4dGVuZGVkIHVuaXQgc3BlY3MgaW50byBjb21wb3NpdGlvbiBvZiBwdXJlIHVuaXQgc3BlY3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemUoc3BlYzogRXh0ZW5kZWRTcGVjKTogU3BlYyB7XG4gIGlmIChpc0V4dGVuZGVkVW5pdFNwZWMoc3BlYykpIHtcbiAgICByZXR1cm4gbm9ybWFsaXplRXh0ZW5kZWRVbml0U3BlYyhzcGVjKTtcbiAgfVxuICBpZiAoaXNVbml0U3BlYyhzcGVjKSkge1xuICAgIHJldHVybiBub3JtYWxpemVVbml0U3BlYyhzcGVjKTtcbiAgfVxuICByZXR1cm4gc3BlYztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZUV4dGVuZGVkVW5pdFNwZWMoc3BlYzogRXh0ZW5kZWRVbml0U3BlYyk6IFNwZWMge1xuICAgIGNvbnN0IGhhc1JvdyA9IGhhcyhzcGVjLmVuY29kaW5nLCBST1cpO1xuICAgIGNvbnN0IGhhc0NvbHVtbiA9IGhhcyhzcGVjLmVuY29kaW5nLCBDT0xVTU4pO1xuXG4gICAgLy8gVE9ETzogQGFydmluZCBwbGVhc2UgIGFkZCBpbnRlcmFjdGlvbiBzeW50YXggaGVyZVxuICAgIGxldCBlbmNvZGluZyA9IGR1cGxpY2F0ZShzcGVjLmVuY29kaW5nKTtcbiAgICBkZWxldGUgZW5jb2RpbmcuY29sdW1uO1xuICAgIGRlbGV0ZSBlbmNvZGluZy5yb3c7XG5cbiAgICByZXR1cm4gZXh0ZW5kKFxuICAgICAgc3BlYy5uYW1lID8geyBuYW1lOiBzcGVjLm5hbWUgfSA6IHt9LFxuICAgICAgc3BlYy5kZXNjcmlwdGlvbiA/IHsgZGVzY3JpcHRpb246IHNwZWMuZGVzY3JpcHRpb24gfSA6IHt9LFxuICAgICAgeyBkYXRhOiBzcGVjLmRhdGEgfSxcbiAgICAgIHNwZWMudHJhbnNmb3JtID8geyB0cmFuc2Zvcm06IHNwZWMudHJhbnNmb3JtIH0gOiB7fSxcbiAgICAgIHtcbiAgICAgICAgZmFjZXQ6IGV4dGVuZChcbiAgICAgICAgICBoYXNSb3cgPyB7IHJvdzogc3BlYy5lbmNvZGluZy5yb3cgfSA6IHt9LFxuICAgICAgICAgIGhhc0NvbHVtbiA/IHsgY29sdW1uOiBzcGVjLmVuY29kaW5nLmNvbHVtbiB9IDoge31cbiAgICAgICAgKSxcbiAgICAgICAgc3BlYzogbm9ybWFsaXplVW5pdFNwZWMoe1xuICAgICAgICAgIG1hcms6IHNwZWMubWFyayxcbiAgICAgICAgICBlbmNvZGluZzogZW5jb2RpbmdcbiAgICAgICAgfSlcbiAgICAgIH0sXG4gICAgICBzcGVjLmNvbmZpZyA/IHsgY29uZmlnOiBzcGVjLmNvbmZpZyB9IDoge31cbiAgICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplVW5pdFNwZWMoc3BlYzogVW5pdFNwZWMpOiBTcGVjIHtcbiAgaWYgKGNvbnRhaW5zKFtFUlJPUkJBUiwgQk9YUExPVF0sIHNwZWMubWFyaykpIHtcbiAgICByZXR1cm4gbm9ybWFsaXplQ29tcG9zaXRlVW5pdFNwZWMoc3BlYyk7XG4gIH1cbiAgaWYgKGlzUmFuZ2VkKHNwZWMuZW5jb2RpbmcpKSB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVJhbmdlZFVuaXRTcGVjKHNwZWMpO1xuICB9XG4gIHJldHVybiBzcGVjO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplUmFuZ2VkVW5pdFNwZWMoc3BlYzogVW5pdFNwZWMpOiBTcGVjIHtcbiAgaWYgKHNwZWMuZW5jb2RpbmcpIHtcbiAgICBjb25zdCBoYXNYID0gaGFzKHNwZWMuZW5jb2RpbmcsIFgpO1xuICAgIGNvbnN0IGhhc1kgPSBoYXMoc3BlYy5lbmNvZGluZywgWSk7XG4gICAgY29uc3QgaGFzWDIgPSBoYXMoc3BlYy5lbmNvZGluZywgWDIpO1xuICAgIGNvbnN0IGhhc1kyID0gaGFzKHNwZWMuZW5jb2RpbmcsIFkyKTtcbiAgICBpZiAoKGhhc1gyICYmICFoYXNYKSB8fCAoaGFzWTIgJiYgIWhhc1kpKSB7XG4gICAgICBsZXQgbm9ybWFsaXplZFNwZWMgPSBkdXBsaWNhdGUoc3BlYyk7XG4gICAgICBpZiAoaGFzWDIgJiYgIWhhc1gpIHtcbiAgICAgICAgbm9ybWFsaXplZFNwZWMuZW5jb2RpbmcueCA9IGR1cGxpY2F0ZShub3JtYWxpemVkU3BlYy5lbmNvZGluZy54Mik7XG4gICAgICAgIGRlbGV0ZSBub3JtYWxpemVkU3BlYy5lbmNvZGluZy54MjtcbiAgICAgIH1cbiAgICAgIGlmIChoYXNZMiAmJiAhaGFzWSkge1xuICAgICAgICBub3JtYWxpemVkU3BlYy5lbmNvZGluZy55ID0gZHVwbGljYXRlKG5vcm1hbGl6ZWRTcGVjLmVuY29kaW5nLnkyKTtcbiAgICAgICAgZGVsZXRlIG5vcm1hbGl6ZWRTcGVjLmVuY29kaW5nLnkyO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbm9ybWFsaXplZFNwZWM7XG4gICAgfVxuICB9XG4gIHJldHVybiBzcGVjO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplQ29tcG9zaXRlVW5pdFNwZWMoc3BlYzogVW5pdFNwZWMpOiBTcGVjIHtcbiAgbGV0IGxheWVyU3BlYyA9IGV4dGVuZChzcGVjLm5hbWUgPyB7bmFtZTogc3BlYy5uYW1lfSA6IHt9LFxuICAgIHNwZWMuZGVzY3JpcHRpb24gPyB7ZGVzY3JpcHRpb246IHNwZWMuZGVzY3JpcHRpb259IDoge30sXG4gICAgc3BlYy5kYXRhID8ge2RhdGE6IHNwZWMuZGF0YX0gOiB7fSxcbiAgICBzcGVjLnRyYW5zZm9ybSA/IHt0cmFuc2Zvcm06IHNwZWMudHJhbnNmb3JtfSA6IHt9LFxuICAgIHNwZWMuY29uZmlnID8ge2NvbmZpZzogc3BlYy5jb25maWd9IDoge30sIHtsYXllcnM6IFtdfVxuICApO1xuICBpZiAoIXNwZWMuZW5jb2RpbmcpIHtcbiAgICByZXR1cm4gbGF5ZXJTcGVjO1xuICB9XG4gIGlmIChzcGVjLm1hcmsgPT09IEVSUk9SQkFSKSB7XG4gICAgY29uc3QgcnVsZVNwZWMgPSB7XG4gICAgICBtYXJrOiBSVUxFLFxuICAgICAgZW5jb2Rpbmc6IGV4dGVuZChcbiAgICAgICAgc3BlYy5lbmNvZGluZy54ID8ge3g6IGR1cGxpY2F0ZShzcGVjLmVuY29kaW5nLngpfSA6IHt9LFxuICAgICAgICBzcGVjLmVuY29kaW5nLnkgPyB7eTogZHVwbGljYXRlKHNwZWMuZW5jb2RpbmcueSl9IDoge30sXG4gICAgICAgIHNwZWMuZW5jb2RpbmcueDIgPyB7eDI6IGR1cGxpY2F0ZShzcGVjLmVuY29kaW5nLngyKX0gOiB7fSxcbiAgICAgICAgc3BlYy5lbmNvZGluZy55MiA/IHt5MjogZHVwbGljYXRlKHNwZWMuZW5jb2RpbmcueTIpfSA6IHt9LFxuICAgICAgICB7fSlcbiAgICB9O1xuICAgIGNvbnN0IGxvd2VyVGlja1NwZWMgPSB7XG4gICAgICBtYXJrOiBUSUNLLFxuICAgICAgZW5jb2Rpbmc6IGV4dGVuZChcbiAgICAgICAgc3BlYy5lbmNvZGluZy54ID8ge3g6IGR1cGxpY2F0ZShzcGVjLmVuY29kaW5nLngpfSA6IHt9LFxuICAgICAgICBzcGVjLmVuY29kaW5nLnkgPyB7eTogZHVwbGljYXRlKHNwZWMuZW5jb2RpbmcueSl9IDoge30sXG4gICAgICAgIHNwZWMuZW5jb2Rpbmcuc2l6ZSA/IHtzaXplOiBkdXBsaWNhdGUoc3BlYy5lbmNvZGluZy5zaXplKX0gOiB7fSxcbiAgICAgICAge30pXG4gICAgfTtcbiAgICBjb25zdCB1cHBlclRpY2tTcGVjID0ge1xuICAgICAgbWFyazogVElDSyxcbiAgICAgIGVuY29kaW5nOiBleHRlbmQoe1xuICAgICAgICB4OiBzcGVjLmVuY29kaW5nLngyID8gZHVwbGljYXRlKHNwZWMuZW5jb2RpbmcueDIpIDogZHVwbGljYXRlKHNwZWMuZW5jb2RpbmcueCksXG4gICAgICAgIHk6IHNwZWMuZW5jb2RpbmcueTIgPyBkdXBsaWNhdGUoc3BlYy5lbmNvZGluZy55MikgOiBkdXBsaWNhdGUoc3BlYy5lbmNvZGluZy55KVxuICAgICAgfSwgc3BlYy5lbmNvZGluZy5zaXplID8ge3NpemU6IGR1cGxpY2F0ZShzcGVjLmVuY29kaW5nLnNpemUpfSA6IHt9KVxuICAgIH07XG4gICAgbGF5ZXJTcGVjLmxheWVycy5wdXNoKG5vcm1hbGl6ZVVuaXRTcGVjKHJ1bGVTcGVjKSk7XG4gICAgbGF5ZXJTcGVjLmxheWVycy5wdXNoKG5vcm1hbGl6ZVVuaXRTcGVjKGxvd2VyVGlja1NwZWMpKTtcbiAgICBsYXllclNwZWMubGF5ZXJzLnB1c2gobm9ybWFsaXplVW5pdFNwZWModXBwZXJUaWNrU3BlYykpO1xuICB9IGVsc2UgaWYgKHNwZWMubWFyayA9PT0gQk9YUExPVCkge1xuICAgIGlmICghc3BlYy5lbmNvZGluZy54IHx8ICFzcGVjLmVuY29kaW5nLnkgfHxcbiAgICAgICAgIShzcGVjLmVuY29kaW5nLngudHlwZSA9PT0gUVVBTlRJVEFUSVZFIHx8XG4gICAgICAgICAgc3BlYy5lbmNvZGluZy55LnR5cGUgPT09IFFVQU5USVRBVElWRSkpIHtcbiAgICAgIHJldHVybiBsYXllclNwZWM7XG4gICAgfVxuICAgIGNvbnN0IG9yaWVudCA9IHNwZWMuZW5jb2RpbmcueC5hZ2dyZWdhdGUgJiYgc3BlYy5lbmNvZGluZy54LnR5cGUgPT09IFFVQU5USVRBVElWRT8gJ2hvcml6b250YWwnIDogJ3ZlcnRpY2FsJztcbiAgICBsZXQgcnVsZVNwZWMgPSB7XG4gICAgICBtYXJrOiBSVUxFLFxuICAgICAgZW5jb2Rpbmc6IGV4dGVuZChcbiAgICAgICAge3g6IGR1cGxpY2F0ZShzcGVjLmVuY29kaW5nLngpfSxcbiAgICAgICAge3k6IGR1cGxpY2F0ZShzcGVjLmVuY29kaW5nLnkpfSxcbiAgICAgICAgb3JpZW50ID09PSAndmVydGljYWwnID8ge3kyOiBkdXBsaWNhdGUoc3BlYy5lbmNvZGluZy55KX0gOiB7eDI6IGR1cGxpY2F0ZShzcGVjLmVuY29kaW5nLngpfSxcbiAgICAgICAge30pXG4gICAgfTtcbiAgICBsZXQgdXBwZXJUaWNrU3BlYyA9IHtcbiAgICAgIG1hcms6IFRJQ0ssXG4gICAgICBlbmNvZGluZzogZXh0ZW5kKFxuICAgICAgICB7eDogZHVwbGljYXRlKHNwZWMuZW5jb2RpbmcueCl9LFxuICAgICAgICB7eTogZHVwbGljYXRlKHNwZWMuZW5jb2RpbmcueSl9LFxuICAgICAgICB7fSlcbiAgICB9O1xuICAgIGxldCBsb3dlclRpY2tTcGVjID0ge1xuICAgICAgbWFyazogVElDSyxcbiAgICAgIGVuY29kaW5nOiBleHRlbmQoXG4gICAgICAgIHt4OiBkdXBsaWNhdGUoc3BlYy5lbmNvZGluZy54KX0sXG4gICAgICAgIHt5OiBkdXBsaWNhdGUoc3BlYy5lbmNvZGluZy55KX0sXG4gICAgICAgIHt9KVxuICAgIH07XG4gICAgbGV0IGxvd2VCYXJTcGVjID0ge1xuICAgICAgbWFyazogQkFSLFxuICAgICAgZW5jb2Rpbmc6IGV4dGVuZChcbiAgICAgICAge3g6IGR1cGxpY2F0ZShzcGVjLmVuY29kaW5nLngpfSxcbiAgICAgICAge3k6IGR1cGxpY2F0ZShzcGVjLmVuY29kaW5nLnkpfSxcbiAgICAgICAgb3JpZW50ID09PSAndmVydGljYWwnID8ge3kyOiBkdXBsaWNhdGUoc3BlYy5lbmNvZGluZy55KX0gOiB7eDI6IGR1cGxpY2F0ZShzcGVjLmVuY29kaW5nLngpfSxcbiAgICAgICAge2NvbG9yOiB7dmFsdWU6ICdvcmFuZ2UnfX0pXG4gICAgfTtcbiAgICBsZXQgdXBwZXJCYXJTcGVjID0ge1xuICAgICAgbWFyazogQkFSLFxuICAgICAgZW5jb2Rpbmc6IGV4dGVuZChcbiAgICAgICAge3g6IGR1cGxpY2F0ZShzcGVjLmVuY29kaW5nLngpfSxcbiAgICAgICAge3k6IGR1cGxpY2F0ZShzcGVjLmVuY29kaW5nLnkpfSxcbiAgICAgICAgb3JpZW50ID09PSAndmVydGljYWwnID8ge3kyOiBkdXBsaWNhdGUoc3BlYy5lbmNvZGluZy55KX0gOiB7eDI6IGR1cGxpY2F0ZShzcGVjLmVuY29kaW5nLngpfSxcbiAgICAgICAge30pXG4gICAgfTtcbiAgICBjb25zdCBhZ2dheGlzID0gb3JpZW50ID09PSAndmVydGljYWwnID8gJ3knIDogJ3gnO1xuICAgIGNvbnN0IGFnZ2F4aXMyID0gb3JpZW50ID09PSAndmVydGljYWwnID8gJ3kyJyA6ICd4Mic7XG4gICAgcnVsZVNwZWMuZW5jb2RpbmdbYWdnYXhpc10uYWdncmVnYXRlID0gJ21pbic7XG4gICAgcnVsZVNwZWMuZW5jb2RpbmdbYWdnYXhpczJdLmFnZ3JlZ2F0ZSA9ICdtYXgnO1xuICAgIHVwcGVyVGlja1NwZWMuZW5jb2RpbmdbYWdnYXhpc10uYWdncmVnYXRlID0gJ21heCc7XG4gICAgbG93ZXJUaWNrU3BlYy5lbmNvZGluZ1thZ2dheGlzXS5hZ2dyZWdhdGUgPSAnbWluJztcbiAgICBsb3dlQmFyU3BlYy5lbmNvZGluZ1thZ2dheGlzXS5hZ2dyZWdhdGUgPSAncTEnO1xuICAgIGxvd2VCYXJTcGVjLmVuY29kaW5nW2FnZ2F4aXMyXS5hZ2dyZWdhdGUgPSAnbWVkaWFuJztcbiAgICB1cHBlckJhclNwZWMuZW5jb2RpbmdbYWdnYXhpc10uYWdncmVnYXRlID0gJ21lZGlhbic7XG4gICAgdXBwZXJCYXJTcGVjLmVuY29kaW5nW2FnZ2F4aXMyXS5hZ2dyZWdhdGUgPSAncTMnO1xuICAgIGxheWVyU3BlYy5sYXllcnMucHVzaChub3JtYWxpemVVbml0U3BlYyhydWxlU3BlYykpO1xuICAgIGxheWVyU3BlYy5sYXllcnMucHVzaChub3JtYWxpemVVbml0U3BlYyhsb3dlclRpY2tTcGVjKSk7XG4gICAgbGF5ZXJTcGVjLmxheWVycy5wdXNoKG5vcm1hbGl6ZVVuaXRTcGVjKHVwcGVyVGlja1NwZWMpKTtcbiAgICBsYXllclNwZWMubGF5ZXJzLnB1c2gobm9ybWFsaXplVW5pdFNwZWMobG93ZUJhclNwZWMpKTtcbiAgICBsYXllclNwZWMubGF5ZXJzLnB1c2gobm9ybWFsaXplVW5pdFNwZWModXBwZXJCYXJTcGVjKSk7XG4gIH1cblxuICByZXR1cm4gbGF5ZXJTcGVjO1xufVxuXG4vLyBUT0RPOiBhZGQgdmwuc3BlYy52YWxpZGF0ZSAmIG1vdmUgc3R1ZmYgZnJvbSB2bC52YWxpZGF0ZSB0byBoZXJlXG5cbmV4cG9ydCBmdW5jdGlvbiBhbHdheXNOb09jY2x1c2lvbihzcGVjOiBFeHRlbmRlZFVuaXRTcGVjKTogYm9vbGVhbiB7XG4gIC8vIEZJWE1FIHJhdyBPeFEgd2l0aCAjIG9mIHJvd3MgPSAjIG9mIE9cbiAgcmV0dXJuIHZsRW5jb2RpbmcuaXNBZ2dyZWdhdGUoc3BlYy5lbmNvZGluZyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaWVsZERlZnMoc3BlYzogRXh0ZW5kZWRVbml0U3BlYyk6IEZpZWxkRGVmW10ge1xuICAvLyBUT0RPOiByZWZhY3RvciB0aGlzIG9uY2Ugd2UgaGF2ZSBjb21wb3NpdGlvblxuICByZXR1cm4gdmxFbmNvZGluZy5maWVsZERlZnMoc3BlYy5lbmNvZGluZyk7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2xlYW5TcGVjKHNwZWM6IEV4dGVuZGVkVW5pdFNwZWMpOiBFeHRlbmRlZFVuaXRTcGVjIHtcbiAgLy8gVE9ETzogbW92ZSB0b1NwZWMgdG8gaGVyZSFcbiAgcmV0dXJuIHNwZWM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1N0YWNrKHNwZWM6IEV4dGVuZGVkVW5pdFNwZWMpOiBib29sZWFuIHtcbiAgcmV0dXJuICh2bEVuY29kaW5nLmhhcyhzcGVjLmVuY29kaW5nLCBDT0xPUikgfHwgdmxFbmNvZGluZy5oYXMoc3BlYy5lbmNvZGluZywgU0hBUEUpKSAmJlxuICAgIChzcGVjLm1hcmsgPT09IEJBUiB8fCBzcGVjLm1hcmsgPT09IEFSRUEpICYmXG4gICAgKCFzcGVjLmNvbmZpZyB8fCAhc3BlYy5jb25maWcubWFyay5zdGFja2VkICE9PSBmYWxzZSkgJiZcbiAgICB2bEVuY29kaW5nLmlzQWdncmVnYXRlKHNwZWMuZW5jb2RpbmcpO1xufVxuXG4vLyBUT0RPIHJldmlzZVxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zcG9zZShzcGVjOiBFeHRlbmRlZFVuaXRTcGVjKTogRXh0ZW5kZWRVbml0U3BlYyB7XG4gIGNvbnN0IG9sZGVuYyA9IHNwZWMuZW5jb2Rpbmc7XG4gIGxldCBlbmNvZGluZyA9IGR1cGxpY2F0ZShzcGVjLmVuY29kaW5nKTtcbiAgZW5jb2RpbmcueCA9IG9sZGVuYy55O1xuICBlbmNvZGluZy55ID0gb2xkZW5jLng7XG4gIGVuY29kaW5nLnJvdyA9IG9sZGVuYy5jb2x1bW47XG4gIGVuY29kaW5nLmNvbHVtbiA9IG9sZGVuYy5yb3c7XG4gIHNwZWMuZW5jb2RpbmcgPSBlbmNvZGluZztcbiAgcmV0dXJuIHNwZWM7XG59XG4iLCJcbmV4cG9ydCBlbnVtIFRpbWVVbml0IHtcbiAgICBZRUFSID0gJ3llYXInIGFzIGFueSxcbiAgICBNT05USCA9ICdtb250aCcgYXMgYW55LFxuICAgIERBWSA9ICdkYXknIGFzIGFueSxcbiAgICBEQVRFID0gJ2RhdGUnIGFzIGFueSxcbiAgICBIT1VSUyA9ICdob3VycycgYXMgYW55LFxuICAgIE1JTlVURVMgPSAnbWludXRlcycgYXMgYW55LFxuICAgIFNFQ09ORFMgPSAnc2Vjb25kcycgYXMgYW55LFxuICAgIE1JTExJU0VDT05EUyA9ICdtaWxsaXNlY29uZHMnIGFzIGFueSxcbiAgICBZRUFSTU9OVEggPSAneWVhcm1vbnRoJyBhcyBhbnksXG4gICAgWUVBUk1PTlRIREFZID0gJ3llYXJtb250aGRheScgYXMgYW55LFxuICAgIFlFQVJNT05USERBVEUgPSAneWVhcm1vbnRoZGF0ZScgYXMgYW55LFxuICAgIFlFQVJEQVkgPSAneWVhcmRheScgYXMgYW55LFxuICAgIFlFQVJEQVRFID0gJ3llYXJkYXRlJyBhcyBhbnksXG4gICAgWUVBUk1PTlRIREFZSE9VUlMgPSAneWVhcm1vbnRoZGF5aG91cnMnIGFzIGFueSxcbiAgICBZRUFSTU9OVEhEQVlIT1VSU01JTlVURVMgPSAneWVhcm1vbnRoZGF5aG91cnNtaW51dGVzJyBhcyBhbnksXG4gICAgWUVBUk1PTlRIREFZSE9VUlNNSU5VVEVTU0VDT05EUyA9ICd5ZWFybW9udGhkYXlob3Vyc21pbnV0ZXNzZWNvbmRzJyBhcyBhbnksXG4gICAgSE9VUlNNSU5VVEVTID0gJ2hvdXJzbWludXRlcycgYXMgYW55LFxuICAgIEhPVVJTTUlOVVRFU1NFQ09ORFMgPSAnaG91cnNtaW51dGVzc2Vjb25kcycgYXMgYW55LFxuICAgIE1JTlVURVNTRUNPTkRTID0gJ21pbnV0ZXNzZWNvbmRzJyBhcyBhbnksXG4gICAgU0VDT05EU01JTExJU0VDT05EUyA9ICdzZWNvbmRzbWlsbGlzZWNvbmRzJyBhcyBhbnksXG59XG5cbmV4cG9ydCBjb25zdCBUSU1FVU5JVFMgPSBbXG4gICAgVGltZVVuaXQuWUVBUixcbiAgICBUaW1lVW5pdC5NT05USCxcbiAgICBUaW1lVW5pdC5EQVksXG4gICAgVGltZVVuaXQuREFURSxcbiAgICBUaW1lVW5pdC5IT1VSUyxcbiAgICBUaW1lVW5pdC5NSU5VVEVTLFxuICAgIFRpbWVVbml0LlNFQ09ORFMsXG4gICAgVGltZVVuaXQuTUlMTElTRUNPTkRTLFxuICAgIFRpbWVVbml0LllFQVJNT05USCxcbiAgICBUaW1lVW5pdC5ZRUFSTU9OVEhEQVksXG4gICAgVGltZVVuaXQuWUVBUk1PTlRIREFURSxcbiAgICBUaW1lVW5pdC5ZRUFSREFZLFxuICAgIFRpbWVVbml0LllFQVJEQVRFLFxuICAgIFRpbWVVbml0LllFQVJNT05USERBWUhPVVJTLFxuICAgIFRpbWVVbml0LllFQVJNT05USERBWUhPVVJTTUlOVVRFUyxcbiAgICBUaW1lVW5pdC5ZRUFSTU9OVEhEQVlIT1VSU01JTlVURVNTRUNPTkRTLFxuICAgIFRpbWVVbml0LkhPVVJTTUlOVVRFUyxcbiAgICBUaW1lVW5pdC5IT1VSU01JTlVURVNTRUNPTkRTLFxuICAgIFRpbWVVbml0Lk1JTlVURVNTRUNPTkRTLFxuICAgIFRpbWVVbml0LlNFQ09ORFNNSUxMSVNFQ09ORFMsXG5dO1xuXG4vKiogcmV0dXJucyB0aGUgdGVtcGxhdGUgbmFtZSB1c2VkIGZvciBheGlzIGxhYmVscyBmb3IgYSB0aW1lIHVuaXQgKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXQodGltZVVuaXQ6IFRpbWVVbml0LCBhYmJyZXZpYXRlZCA9IGZhbHNlKTogc3RyaW5nIHtcbiAgaWYgKCF0aW1lVW5pdCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBsZXQgdGltZVN0cmluZyA9IHRpbWVVbml0LnRvU3RyaW5nKCk7XG5cbiAgbGV0IGRhdGVDb21wb25lbnRzID0gW107XG5cbiAgaWYgKHRpbWVTdHJpbmcuaW5kZXhPZigneWVhcicpID4gLTEpIHtcbiAgICBkYXRlQ29tcG9uZW50cy5wdXNoKGFiYnJldmlhdGVkID8gJyV5JyA6ICclWScpO1xuICB9XG5cbiAgaWYgKHRpbWVTdHJpbmcuaW5kZXhPZignbW9udGgnKSA+IC0xKSB7XG4gICAgZGF0ZUNvbXBvbmVudHMucHVzaChhYmJyZXZpYXRlZCA/ICclYicgOiAnJUInKTtcbiAgfVxuXG4gIGlmICh0aW1lU3RyaW5nLmluZGV4T2YoJ2RheScpID4gLTEpIHtcbiAgICBkYXRlQ29tcG9uZW50cy5wdXNoKGFiYnJldmlhdGVkID8gJyVhJyA6ICclQScpO1xuICB9IGVsc2UgaWYgKHRpbWVTdHJpbmcuaW5kZXhPZignZGF0ZScpID4gLTEpIHtcbiAgICBkYXRlQ29tcG9uZW50cy5wdXNoKCclZCcpO1xuICB9XG5cbiAgbGV0IHRpbWVDb21wb25lbnRzID0gW107XG5cbiAgaWYgKHRpbWVTdHJpbmcuaW5kZXhPZignaG91cnMnKSA+IC0xKSB7XG4gICAgdGltZUNvbXBvbmVudHMucHVzaCgnJUgnKTtcbiAgfVxuICBpZiAodGltZVN0cmluZy5pbmRleE9mKCdtaW51dGVzJykgPiAtMSkge1xuICAgIHRpbWVDb21wb25lbnRzLnB1c2goJyVNJyk7XG4gIH1cbiAgaWYgKHRpbWVTdHJpbmcuaW5kZXhPZignc2Vjb25kcycpID4gLTEpIHtcbiAgICB0aW1lQ29tcG9uZW50cy5wdXNoKCclUycpO1xuICB9XG4gIGlmICh0aW1lU3RyaW5nLmluZGV4T2YoJ21pbGxpc2Vjb25kcycpID4gLTEpIHtcbiAgICB0aW1lQ29tcG9uZW50cy5wdXNoKCclTCcpO1xuICB9XG5cbiAgbGV0IG91dCA9IFtdO1xuICBpZiAoZGF0ZUNvbXBvbmVudHMubGVuZ3RoID4gMCkge1xuICAgIG91dC5wdXNoKGRhdGVDb21wb25lbnRzLmpvaW4oJy0nKSk7XG4gIH1cbiAgaWYgKHRpbWVDb21wb25lbnRzLmxlbmd0aCA+IDApIHtcbiAgICBvdXQucHVzaCh0aW1lQ29tcG9uZW50cy5qb2luKCc6JykpO1xuICB9XG5cbiAgcmV0dXJuIG91dC5sZW5ndGggPiAwID8gb3V0LmpvaW4oJyAnKSA6IHVuZGVmaW5lZDtcbn1cbiIsIi8qKiBDb25zdGFudHMgYW5kIHV0aWxpdGllcyBmb3IgZGF0YSB0eXBlICovXG5cbmV4cG9ydCBlbnVtIFR5cGUge1xuICBRVUFOVElUQVRJVkUgPSAncXVhbnRpdGF0aXZlJyBhcyBhbnksXG4gIE9SRElOQUwgPSAnb3JkaW5hbCcgYXMgYW55LFxuICBURU1QT1JBTCA9ICd0ZW1wb3JhbCcgYXMgYW55LFxuICBOT01JTkFMID0gJ25vbWluYWwnIGFzIGFueVxufVxuXG5leHBvcnQgY29uc3QgUVVBTlRJVEFUSVZFID0gVHlwZS5RVUFOVElUQVRJVkU7XG5leHBvcnQgY29uc3QgT1JESU5BTCA9IFR5cGUuT1JESU5BTDtcbmV4cG9ydCBjb25zdCBURU1QT1JBTCA9IFR5cGUuVEVNUE9SQUw7XG5leHBvcnQgY29uc3QgTk9NSU5BTCA9IFR5cGUuTk9NSU5BTDtcblxuLyoqXG4gKiBNYXBwaW5nIGZyb20gZnVsbCB0eXBlIG5hbWVzIHRvIHNob3J0IHR5cGUgbmFtZXMuXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5leHBvcnQgY29uc3QgU0hPUlRfVFlQRSA9IHtcbiAgcXVhbnRpdGF0aXZlOiAnUScsXG4gIHRlbXBvcmFsOiAnVCcsXG4gIG5vbWluYWw6ICdOJyxcbiAgb3JkaW5hbDogJ08nXG59O1xuLyoqXG4gKiBNYXBwaW5nIGZyb20gc2hvcnQgdHlwZSBuYW1lcyB0byBmdWxsIHR5cGUgbmFtZXMuXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5leHBvcnQgY29uc3QgVFlQRV9GUk9NX1NIT1JUX1RZUEUgPSB7XG4gIFE6IFFVQU5USVRBVElWRSxcbiAgVDogVEVNUE9SQUwsXG4gIE86IE9SRElOQUwsXG4gIE46IE5PTUlOQUxcbn07XG5cbi8qKlxuICogR2V0IGZ1bGwsIGxvd2VyY2FzZSB0eXBlIG5hbWUgZm9yIGEgZ2l2ZW4gdHlwZS5cbiAqIEBwYXJhbSAgdHlwZVxuICogQHJldHVybiBGdWxsIHR5cGUgbmFtZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEZ1bGxOYW1lKHR5cGU6IFR5cGUpOiBUeXBlIHtcbiAgY29uc3QgdHlwZVN0cmluZyA9IDxhbnk+dHlwZTsgIC8vIGZvcmNlIHR5cGUgYXMgc3RyaW5nIHNvIHdlIGNhbiB0cmFuc2xhdGUgc2hvcnQgdHlwZXNcbiAgcmV0dXJuIFRZUEVfRlJPTV9TSE9SVF9UWVBFW3R5cGVTdHJpbmcudG9VcHBlckNhc2UoKV0gfHwgLy8gc2hvcnQgdHlwZSBpcyB1cHBlcmNhc2UgYnkgZGVmYXVsdFxuICAgICAgICAgdHlwZVN0cmluZy50b0xvd2VyQ2FzZSgpO1xufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvZGF0YWxpYi5kLnRzXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvanNvbi1zdGFibGUtc3RyaW5naWZ5LmQudHNcIi8+XG5cbmltcG9ydCAqIGFzIHN0cmluZ2lmeSBmcm9tICdqc29uLXN0YWJsZS1zdHJpbmdpZnknO1xuZXhwb3J0IHtrZXlzLCBleHRlbmQsIGR1cGxpY2F0ZSwgaXNBcnJheSwgdmFscywgdHJ1bmNhdGUsIHRvTWFwLCBpc09iamVjdCwgaXNTdHJpbmcsIGlzTnVtYmVyLCBpc0Jvb2xlYW59IGZyb20gJ2RhdGFsaWIvc3JjL3V0aWwnO1xuZXhwb3J0IHtyYW5nZX0gZnJvbSAnZGF0YWxpYi9zcmMvZ2VuZXJhdGUnO1xuZXhwb3J0IHtoYXN9IGZyb20gJy4vZW5jb2RpbmcnXG5leHBvcnQge0ZpZWxkRGVmfSBmcm9tICcuL2ZpZWxkZGVmJztcbmV4cG9ydCB7Q2hhbm5lbH0gZnJvbSAnLi9jaGFubmVsJztcblxuaW1wb3J0IHtpc1N0cmluZywgaXNOdW1iZXIsIGlzQm9vbGVhbn0gZnJvbSAnZGF0YWxpYi9zcmMvdXRpbCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNoKGE6IGFueSkge1xuICBpZiAoaXNTdHJpbmcoYSkgfHwgaXNOdW1iZXIoYSkgfHwgaXNCb29sZWFuKGEpKSB7XG4gICAgcmV0dXJuIFN0cmluZyhhKTtcbiAgfVxuICByZXR1cm4gc3RyaW5naWZ5KGEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29udGFpbnM8VD4oYXJyYXk6IEFycmF5PFQ+LCBpdGVtOiBUKSB7XG4gIHJldHVybiBhcnJheS5pbmRleE9mKGl0ZW0pID4gLTE7XG59XG5cbi8qKiBSZXR1cm5zIHRoZSBhcnJheSB3aXRob3V0IHRoZSBlbGVtZW50cyBpbiBpdGVtICovXG5leHBvcnQgZnVuY3Rpb24gd2l0aG91dDxUPihhcnJheTogQXJyYXk8VD4sIGV4Y2x1ZGVkSXRlbXM6IEFycmF5PFQ+KSB7XG4gIHJldHVybiBhcnJheS5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xuICAgIHJldHVybiAhY29udGFpbnMoZXhjbHVkZWRJdGVtcywgaXRlbSk7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5pb248VD4oYXJyYXk6IEFycmF5PFQ+LCBvdGhlcjogQXJyYXk8VD4pIHtcbiAgcmV0dXJuIGFycmF5LmNvbmNhdCh3aXRob3V0KG90aGVyLCBhcnJheSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZm9yRWFjaChvYmosIGY6IChhLCBkLCBrLCBvKSA9PiBhbnksIHRoaXNBcmc/KSB7XG4gIGlmIChvYmouZm9yRWFjaCkge1xuICAgIG9iai5mb3JFYWNoLmNhbGwodGhpc0FyZywgZik7XG4gIH0gZWxzZSB7XG4gICAgZm9yIChsZXQgayBpbiBvYmopIHtcbiAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgICAgZi5jYWxsKHRoaXNBcmcsIG9ialtrXSwgaywgb2JqKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZHVjZShvYmosIGY6IChhLCBpLCBkLCBrLCBvKSA9PiBhbnksIGluaXQsIHRoaXNBcmc/KSB7XG4gIGlmIChvYmoucmVkdWNlKSB7XG4gICAgcmV0dXJuIG9iai5yZWR1Y2UuY2FsbCh0aGlzQXJnLCBmLCBpbml0KTtcbiAgfSBlbHNlIHtcbiAgICBmb3IgKGxldCBrIGluIG9iaikge1xuICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgICBpbml0ID0gZi5jYWxsKHRoaXNBcmcsIGluaXQsIG9ialtrXSwgaywgb2JqKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGluaXQ7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hcChvYmosIGY6IChhLCBkLCBrLCBvKSA9PiBhbnksIHRoaXNBcmc/KSB7XG4gIGlmIChvYmoubWFwKSB7XG4gICAgcmV0dXJuIG9iai5tYXAuY2FsbCh0aGlzQXJnLCBmKTtcbiAgfSBlbHNlIHtcbiAgICBsZXQgb3V0cHV0ID0gW107XG4gICAgZm9yIChsZXQgayBpbiBvYmopIHtcbiAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgICAgb3V0cHV0LnB1c2goZi5jYWxsKHRoaXNBcmcsIG9ialtrXSwgaywgb2JqKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFueTxUPihhcnI6IEFycmF5PFQ+LCBmOiAoZDogVCwgaz8sIGk/KSA9PiBib29sZWFuKSB7XG4gIGxldCBpID0gMDtcbiAgZm9yIChsZXQgayA9IDA7IGs8YXJyLmxlbmd0aDsgaysrKSB7XG4gICAgaWYgKGYoYXJyW2tdLCBrLCBpKyspKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYWxsPFQ+KGFycjogQXJyYXk8VD4sIGY6IChkOiBULCBrPywgaT8pID0+IGJvb2xlYW4pIHtcbiAgbGV0IGkgPSAwO1xuICBmb3IgKGxldCBrID0gMDsgazxhcnIubGVuZ3RoOyBrKyspIHtcbiAgICBpZiAoIWYoYXJyW2tdLCBrLCBpKyspKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmxhdHRlbihhcnJheXM6IGFueVtdKSB7XG4gIHJldHVybiBbXS5jb25jYXQuYXBwbHkoW10sIGFycmF5cyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZURlZXAoZGVzdCwgLi4uc3JjOiBhbnlbXSkge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHNyYy5sZW5ndGg7IGkrKykge1xuICAgIGRlc3QgPSBkZWVwTWVyZ2VfKGRlc3QsIHNyY1tpXSk7XG4gIH1cbiAgcmV0dXJuIGRlc3Q7XG59O1xuXG4vLyByZWN1cnNpdmVseSBtZXJnZXMgc3JjIGludG8gZGVzdFxuZnVuY3Rpb24gZGVlcE1lcmdlXyhkZXN0LCBzcmMpIHtcbiAgaWYgKHR5cGVvZiBzcmMgIT09ICdvYmplY3QnIHx8IHNyYyA9PT0gbnVsbCkge1xuICAgIHJldHVybiBkZXN0O1xuICB9XG5cbiAgZm9yIChsZXQgcCBpbiBzcmMpIHtcbiAgICBpZiAoIXNyYy5oYXNPd25Qcm9wZXJ0eShwKSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChzcmNbcF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygc3JjW3BdICE9PSAnb2JqZWN0JyB8fCBzcmNbcF0gPT09IG51bGwpIHtcbiAgICAgIGRlc3RbcF0gPSBzcmNbcF07XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGVzdFtwXSAhPT0gJ29iamVjdCcgfHwgZGVzdFtwXSA9PT0gbnVsbCkge1xuICAgICAgZGVzdFtwXSA9IG1lcmdlRGVlcChzcmNbcF0uY29uc3RydWN0b3IgPT09IEFycmF5ID8gW10gOiB7fSwgc3JjW3BdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbWVyZ2VEZWVwKGRlc3RbcF0sIHNyY1twXSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBkZXN0O1xufVxuXG4vLyBGSVhNRSByZW1vdmUgdGhpc1xuaW1wb3J0ICogYXMgZGxCaW4gZnJvbSAnZGF0YWxpYi9zcmMvYmlucy9iaW5zJztcbmV4cG9ydCBmdW5jdGlvbiBnZXRiaW5zKHN0YXRzLCBtYXhiaW5zKSB7XG4gIHJldHVybiBkbEJpbih7XG4gICAgbWluOiBzdGF0cy5taW4sXG4gICAgbWF4OiBzdGF0cy5tYXgsXG4gICAgbWF4YmluczogbWF4Ymluc1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuaXF1ZTxUPih2YWx1ZXM6IFRbXSwgZj86IChpdGVtOiBUKSA9PiBzdHJpbmcpIHtcbiAgbGV0IHJlc3VsdHMgPSBbXTtcbiAgdmFyIHUgPSB7fSwgdiwgaSwgbjtcbiAgZm9yIChpID0gMCwgbiA9IHZhbHVlcy5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICB2ID0gZiA/IGYodmFsdWVzW2ldKSA6IHZhbHVlc1tpXTtcbiAgICBpZiAodiBpbiB1KSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgdVt2XSA9IDE7XG4gICAgcmVzdWx0cy5wdXNoKHZhbHVlc1tpXSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHM7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gd2FybmluZyhtZXNzYWdlOiBhbnkpIHtcbiAgY29uc29sZS53YXJuKCdbVkwgV2FybmluZ10nLCBtZXNzYWdlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVycm9yKG1lc3NhZ2U6IGFueSkge1xuICBjb25zb2xlLmVycm9yKCdbVkwgRXJyb3JdJywgbWVzc2FnZSk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGljdDxUPiB7XG4gIFtrZXk6IHN0cmluZ106IFQ7XG59XG5cbmV4cG9ydCB0eXBlIFN0cmluZ1NldCA9IERpY3Q8Ym9vbGVhbj47XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSB0d28gZGljaXRvbmFyaWVzIGRpc2FncmVlLiBBcHBsaWVzIG9ubHkgdG8gZGVmaW9uZWQgdmFsdWVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlmZmVyPFQ+KGRpY3Q6IERpY3Q8VD4sIG90aGVyOiBEaWN0PFQ+KSB7XG4gIGZvciAobGV0IGtleSBpbiBkaWN0KSB7XG4gICAgaWYgKGRpY3QuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgaWYgKG90aGVyW2tleV0gJiYgZGljdFtrZXldICYmIG90aGVyW2tleV0gIT09IGRpY3Rba2V5XSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuIiwiaW1wb3J0IHtFeHRlbmRlZFVuaXRTcGVjfSBmcm9tICcuL3NwZWMnO1xuXG4vLyBUT0RPOiBtb3ZlIHRvIHZsLnNwZWMudmFsaWRhdG9yP1xuXG5pbXBvcnQge3RvTWFwfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHtCQVJ9IGZyb20gJy4vbWFyayc7XG5cbmludGVyZmFjZSBSZXF1aXJlZENoYW5uZWxNYXAge1xuICBbbWFyazogc3RyaW5nXTogQXJyYXk8c3RyaW5nPjtcbn1cblxuLyoqXG4gKiBSZXF1aXJlZCBFbmNvZGluZyBDaGFubmVscyBmb3IgZWFjaCBtYXJrIHR5cGVcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX1JFUVVJUkVEX0NIQU5ORUxfTUFQOiBSZXF1aXJlZENoYW5uZWxNYXAgPSB7XG4gIHRleHQ6IFsndGV4dCddLFxuICBsaW5lOiBbJ3gnLCAneSddLFxuICBhcmVhOiBbJ3gnLCAneSddXG59O1xuXG5pbnRlcmZhY2UgU3VwcG9ydGVkQ2hhbm5lbE1hcCB7XG4gIFttYXJrOiBzdHJpbmddOiB7XG4gICAgW2NoYW5uZWw6IHN0cmluZ106IG51bWJlclxuICB9O1xufVxuXG4vKipcbiAqIFN1cHBvcnRlZCBFbmNvZGluZyBDaGFubmVsIGZvciBlYWNoIG1hcmsgdHlwZVxuICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9TVVBQT1JURURfQ0hBTk5FTF9UWVBFOiBTdXBwb3J0ZWRDaGFubmVsTWFwID0ge1xuICBiYXI6IHRvTWFwKFsncm93JywgJ2NvbHVtbicsICd4JywgJ3knLCAnc2l6ZScsICdjb2xvcicsICdkZXRhaWwnXSksXG4gIGxpbmU6IHRvTWFwKFsncm93JywgJ2NvbHVtbicsICd4JywgJ3knLCAnY29sb3InLCAnZGV0YWlsJ10pLCAvLyBUT0RPOiBhZGQgc2l6ZSB3aGVuIFZlZ2Egc3VwcG9ydHNcbiAgYXJlYTogdG9NYXAoWydyb3cnLCAnY29sdW1uJywgJ3gnLCAneScsICdjb2xvcicsICdkZXRhaWwnXSksXG4gIHRpY2s6IHRvTWFwKFsncm93JywgJ2NvbHVtbicsICd4JywgJ3knLCAnY29sb3InLCAnZGV0YWlsJ10pLFxuICBjaXJjbGU6IHRvTWFwKFsncm93JywgJ2NvbHVtbicsICd4JywgJ3knLCAnY29sb3InLCAnc2l6ZScsICdkZXRhaWwnXSksXG4gIHNxdWFyZTogdG9NYXAoWydyb3cnLCAnY29sdW1uJywgJ3gnLCAneScsICdjb2xvcicsICdzaXplJywgJ2RldGFpbCddKSxcbiAgcG9pbnQ6IHRvTWFwKFsncm93JywgJ2NvbHVtbicsICd4JywgJ3knLCAnY29sb3InLCAnc2l6ZScsICdkZXRhaWwnLCAnc2hhcGUnXSksXG4gIHRleHQ6IHRvTWFwKFsncm93JywgJ2NvbHVtbicsICdzaXplJywgJ2NvbG9yJywgJ3RleHQnXSkgLy8gVE9ETygjNzI0KSByZXZpc2Vcbn07XG5cbi8vIFRPRE86IGNvbnNpZGVyIGlmIHdlIHNob3VsZCBhZGQgdmFsaWRhdGUgbWV0aG9kIGFuZFxuLy8gcmVxdWlyZXMgWlNjaGVtYSBpbiB0aGUgbWFpbiB2ZWdhLWxpdGUgcmVwb1xuXG4vKipcbiAqIEZ1cnRoZXIgY2hlY2sgaWYgZW5jb2RpbmcgbWFwcGluZyBvZiBhIHNwZWMgaXMgaW52YWxpZCBhbmRcbiAqIHJldHVybiBlcnJvciBpZiBpdCBpcyBpbnZhbGlkLlxuICpcbiAqIFRoaXMgY2hlY2tzIGlmXG4gKiAoMSkgYWxsIHRoZSByZXF1aXJlZCBlbmNvZGluZyBjaGFubmVscyBmb3IgdGhlIG1hcmsgdHlwZSBhcmUgc3BlY2lmaWVkXG4gKiAoMikgYWxsIHRoZSBzcGVjaWZpZWQgZW5jb2RpbmcgY2hhbm5lbHMgYXJlIHN1cHBvcnRlZCBieSB0aGUgbWFyayB0eXBlXG4gKiBAcGFyYW0gIHtbdHlwZV19IHNwZWMgW2Rlc2NyaXB0aW9uXVxuICogQHBhcmFtICB7UmVxdWlyZWRDaGFubmVsTWFwICA9IERlZmF1bHRSZXF1aXJlZENoYW5uZWxNYXB9ICByZXF1aXJlZENoYW5uZWxNYXBcbiAqIEBwYXJhbSAge1N1cHBvcnRlZENoYW5uZWxNYXAgPSBEZWZhdWx0U3VwcG9ydGVkQ2hhbm5lbE1hcH0gc3VwcG9ydGVkQ2hhbm5lbE1hcFxuICogQHJldHVybiB7U3RyaW5nfSBSZXR1cm4gb25lIHJlYXNvbiB3aHkgdGhlIGVuY29kaW5nIGlzIGludmFsaWQsXG4gKiAgICAgICAgICAgICAgICAgIG9yIG51bGwgaWYgdGhlIGVuY29kaW5nIGlzIHZhbGlkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RW5jb2RpbmdNYXBwaW5nRXJyb3Ioc3BlYzogRXh0ZW5kZWRVbml0U3BlYyxcbiAgcmVxdWlyZWRDaGFubmVsTWFwOiBSZXF1aXJlZENoYW5uZWxNYXAgPSBERUZBVUxUX1JFUVVJUkVEX0NIQU5ORUxfTUFQLFxuICBzdXBwb3J0ZWRDaGFubmVsTWFwOiBTdXBwb3J0ZWRDaGFubmVsTWFwID0gREVGQVVMVF9TVVBQT1JURURfQ0hBTk5FTF9UWVBFXG4gICkge1xuICBsZXQgbWFyayA9IHNwZWMubWFyaztcbiAgbGV0IGVuY29kaW5nID0gc3BlYy5lbmNvZGluZztcbiAgbGV0IHJlcXVpcmVkQ2hhbm5lbHMgPSByZXF1aXJlZENoYW5uZWxNYXBbbWFya107XG4gIGxldCBzdXBwb3J0ZWRDaGFubmVscyA9IHN1cHBvcnRlZENoYW5uZWxNYXBbbWFya107XG5cbiAgZm9yIChsZXQgaSBpbiByZXF1aXJlZENoYW5uZWxzKSB7IC8vIGFsbCByZXF1aXJlZCBjaGFubmVscyBhcmUgaW4gZW5jb2RpbmdgXG4gICAgaWYgKCEocmVxdWlyZWRDaGFubmVsc1tpXSBpbiBlbmNvZGluZykpIHtcbiAgICAgIHJldHVybiAnTWlzc2luZyBlbmNvZGluZyBjaGFubmVsIFxcXCInICsgcmVxdWlyZWRDaGFubmVsc1tpXSArXG4gICAgICAgICdcXFwiIGZvciBtYXJrIFxcXCInICsgbWFyayArICdcXFwiJztcbiAgICB9XG4gIH1cblxuICBmb3IgKGxldCBjaGFubmVsIGluIGVuY29kaW5nKSB7IC8vIGFsbCBjaGFubmVscyBpbiBlbmNvZGluZyBhcmUgc3VwcG9ydGVkXG4gICAgaWYgKCFzdXBwb3J0ZWRDaGFubmVsc1tjaGFubmVsXSkge1xuICAgICAgcmV0dXJuICdFbmNvZGluZyBjaGFubmVsIFxcXCInICsgY2hhbm5lbCArXG4gICAgICAgICdcXFwiIGlzIG5vdCBzdXBwb3J0ZWQgYnkgbWFyayB0eXBlIFxcXCInICsgbWFyayArICdcXFwiJztcbiAgICB9XG4gIH1cblxuICBpZiAobWFyayA9PT0gQkFSICYmICFlbmNvZGluZy54ICYmICFlbmNvZGluZy55KSB7XG4gICAgcmV0dXJuICdNaXNzaW5nIGJvdGggeCBhbmQgeSBmb3IgYmFyJztcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuIiwiaW1wb3J0IHtpc0FycmF5fSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHtTY2FsZVR5cGUsIE5pY2VUaW1lfSBmcm9tICcuL3NjYWxlJztcblxuZXhwb3J0IGludGVyZmFjZSBWZ0RhdGEge1xuICBuYW1lOiBzdHJpbmc7XG4gIHNvdXJjZT86IHN0cmluZztcbiAgdmFsdWVzPzogYW55O1xuICBmb3JtYXQ/OiBhbnk7XG4gIHVybD86IGFueTtcbiAgdHJhbnNmb3JtPzogYW55O1xufVxuXG50eXBlIFZnUGFyZW50UmVmID0ge1xuICBwYXJlbnQ6IHN0cmluZ1xufTtcblxudHlwZSBWZ0ZpZWxkUmVmID0gc3RyaW5nIHwgVmdQYXJlbnRSZWYgfCBWZ1BhcmVudFJlZltdO1xuXG5leHBvcnQgdHlwZSBWZ0RhdGFSZWYgPSB7XG4gIGRhdGE6IHN0cmluZyxcbiAgZmllbGQ6IFZnRmllbGRSZWYsXG4gIHNvcnQ6IGJvb2xlYW4gfCB7XG4gICAgZmllbGQ6IFZnRmllbGRSZWYsXG4gICAgb3A6IHN0cmluZ1xuICB9XG59O1xuXG5leHBvcnQgdHlwZSBVbmlvbmVkRG9tYWluID0ge1xuICBmaWVsZHM6IFZnRGF0YVJlZltdXG59O1xuXG5leHBvcnQgdHlwZSBWZ1NjYWxlID0ge1xuICBuYW1lOiBzdHJpbmcsXG4gIHR5cGU6IFNjYWxlVHlwZSxcbiAgZG9tYWluPzogYW55W10gfCBVbmlvbmVkRG9tYWluIHwgVmdEYXRhUmVmLFxuICBkb21haW5NaW4/OiBhbnksXG4gIGRvbWFpbk1heD86IGFueVxuICByYW5nZT86IGFueVtdIHwgVmdEYXRhUmVmIHwgc3RyaW5nLFxuICByYW5nZU1pbj86IGFueSxcbiAgcmFuZ2VNYXg/OiBhbnksXG5cbiAgYmFuZFNpemU/OiBudW1iZXIsXG4gIGNsYW1wPzogYm9vbGVhbixcbiAgZXhwb25lbnQ/OiBudW1iZXIsXG4gIG5pY2U/OiBib29sZWFuIHwgTmljZVRpbWUsXG4gIHBhZGRpbmc/OiBudW1iZXIsXG4gIHBvaW50cz86IGJvb2xlYW4sXG4gIHJldmVyc2U/OiBib29sZWFuLFxuICByb3VuZD86IGJvb2xlYW4sXG4gIHplcm8/OiBib29sZWFuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1VuaW9uZWREb21haW4oZG9tYWluOiBhbnlbXSB8IFVuaW9uZWREb21haW4gfCBWZ0RhdGFSZWYpOiBkb21haW4gaXMgVW5pb25lZERvbWFpbiB7XG4gIGlmICghaXNBcnJheShkb21haW4pKSB7XG4gICAgcmV0dXJuICdmaWVsZHMnIGluIGRvbWFpbjtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RhdGFSZWZEb21haW4oZG9tYWluOiBhbnlbXSB8IFVuaW9uZWREb21haW4gfCBWZ0RhdGFSZWYpOiBkb21haW4gaXMgVmdEYXRhUmVmIHtcbiAgaWYgKCFpc0FycmF5KGRvbWFpbikpIHtcbiAgICByZXR1cm4gJ2RhdGEnIGluIGRvbWFpbjtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8vIFRPRE86IGRlY2xhcmVcbmV4cG9ydCB0eXBlIFZnTWFya0dyb3VwID0gYW55O1xuZXhwb3J0IHR5cGUgVmdBeGlzID0gYW55O1xuZXhwb3J0IHR5cGUgVmdMZWdlbmQgPSBhbnk7XG5leHBvcnQgdHlwZSBWZ1RyYW5zZm9ybSA9IGFueTtcbiIsImltcG9ydCAqIGFzIHZsQmluIGZyb20gJy4vYmluJztcbmltcG9ydCAqIGFzIHZsQ2hhbm5lbCBmcm9tICcuL2NoYW5uZWwnO1xuaW1wb3J0ICogYXMgdmxDb25maWcgZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0ICogYXMgdmxEYXRhIGZyb20gJy4vZGF0YSc7XG5pbXBvcnQgKiBhcyB2bEVuY29kaW5nIGZyb20gJy4vZW5jb2RpbmcnO1xuaW1wb3J0ICogYXMgdmxGaWVsZERlZiBmcm9tICcuL2ZpZWxkZGVmJztcbmltcG9ydCAqIGFzIHZsQ29tcGlsZSBmcm9tICcuL2NvbXBpbGUvY29tcGlsZSc7XG5pbXBvcnQgKiBhcyB2bFNob3J0aGFuZCBmcm9tICcuL3Nob3J0aGFuZCc7XG5pbXBvcnQgKiBhcyB2bFNwZWMgZnJvbSAnLi9zcGVjJztcbmltcG9ydCAqIGFzIHZsVGltZVVuaXQgZnJvbSAnLi90aW1ldW5pdCc7XG5pbXBvcnQgKiBhcyB2bFR5cGUgZnJvbSAnLi90eXBlJztcbmltcG9ydCAqIGFzIHZsVmFsaWRhdGUgZnJvbSAnLi92YWxpZGF0ZSc7XG5pbXBvcnQgKiBhcyB2bFV0aWwgZnJvbSAnLi91dGlsJztcblxuZXhwb3J0IGNvbnN0IGJpbiA9IHZsQmluO1xuZXhwb3J0IGNvbnN0IGNoYW5uZWwgPSB2bENoYW5uZWw7XG5leHBvcnQgY29uc3QgY29tcGlsZSA9IHZsQ29tcGlsZS5jb21waWxlO1xuZXhwb3J0IGNvbnN0IGNvbmZpZyA9IHZsQ29uZmlnO1xuZXhwb3J0IGNvbnN0IGRhdGEgPSB2bERhdGE7XG5leHBvcnQgY29uc3QgZW5jb2RpbmcgPSB2bEVuY29kaW5nO1xuZXhwb3J0IGNvbnN0IGZpZWxkRGVmID0gdmxGaWVsZERlZjtcbmV4cG9ydCBjb25zdCBzaG9ydGhhbmQgPSB2bFNob3J0aGFuZDtcbmV4cG9ydCBjb25zdCBzcGVjID0gdmxTcGVjO1xuZXhwb3J0IGNvbnN0IHRpbWVVbml0ID0gdmxUaW1lVW5pdDtcbmV4cG9ydCBjb25zdCB0eXBlID0gdmxUeXBlO1xuZXhwb3J0IGNvbnN0IHV0aWwgPSB2bFV0aWw7XG5leHBvcnQgY29uc3QgdmFsaWRhdGUgPSB2bFZhbGlkYXRlO1xuXG5leHBvcnQgY29uc3QgdmVyc2lvbiA9ICdfX1ZFUlNJT05fXyc7XG4iXX0=

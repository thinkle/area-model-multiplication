var NUMBER_WORDS = [
    {matcher:/\b(one|a)\b/i,
     value:1},
    {matcher:/(two|\ba\s*(couple|pair)\b)/i,
     value:2},
    {matcher:/(\b(one|a)\b\s*)?half(\s+(a|an))?\b/i,
     value:0.5},
    {matcher:/\bthree\b/i,value:3},
]

for (let word of NUMBER_WORDS) {
    if (isNaN(word.value)) {
        throw Error(`bad word ${word.matcher} ${word.value}`);
    }
}

NUMBER_WORDS.reverse(); // longest to shortest - match greedy first


function getValueFromNumberWord (s) {
    let value = NaN;
    for (let numberWord of NUMBER_WORDS) {
        // We assume NUMBER_WORDS is in order from most to least
        // specific, so if, for example twenty-two matches twenty and
        // two and twenty-two, twenty-two will come first.
        // I *think* but haven't rigorously confirmed that this works
        // for all numbers with larger numbers being more specific than
        // smaller numbers in terms of regexp matching
        if (s.match(numberWord.matcher)) {
            return numberWord.value
        }
    }
}


var NUMBER_FRACTIONS = [
    {numerator:1,
     denominator:2,
     word:'\u00BD'},
    {numerator:1,
     denominator:4,
     word:'\u00BC'},
    {numerator:3,
     denominator:4,
     word:'\u00BE'},
    {numerator:1,
     denominator:3,
     word:'\u2153'},
    {numerator:2,
     denominator:3,
     word:'\u2154'},
    {numerator:1,
     denominator:5,
     word:'\u2155'},
    {numerator:2,
     denominator:5,
     word:'\u2156'},
    {numerator:3,
     denominator:5,
     word:'\u2157'},
    {numerator:4,
     denominator:5,
     word:'\u2158'},
    {numerator:1,
     denominator:6,
     word:'\u2159'},
    {numerator:5,
     denominator:6,
     word:'\u215A'},
    {numerator:1,
     denominator:8,
     word:'\u215B'},
    {numerator:3,
     denominator:8,
     word:'\u215C'},
    {numerator:5,
     denominator:8,
     word:'\u215D'},
    {numerator:7,
     denominator:8,
     word:'\u215E'},
]

function getFraction (n, d, unicodeFractions=true) {
    if (unicodeFractions) {
        for (var f of NUMBER_FRACTIONS) {
	    if (n==f.numerator && d==f.denominator) {
	        return f.word
	    }
        }
        return n + 'D' + d; // fancy unicode fraction slash
    }
    return n+'/'+d
}

function floatToFrac (n, {denominators=[2,3,4,5,6,8,16], approx=0.01, fallbackDigits=2,
                          unicodeFractions=true,multiplier=1}={}) {
    n *= multiplier
    if (n===0) {
        return '0'
    }
    else if (!n) {
        return ''
    }
    var i, f
    if (n >= 1) {
	i = Math.floor(n).toString()
    }
    else {
	i = ''
    }
    var rem = n % 1;
    if (rem==0 || rem<approx) {
	return i || '0'
    }
    else {
	// now we fractify...
	for (var den of denominators) {
	    var result = fractify(rem,den)
	    if (result) {
                if (i) {
		    return i+' '+getFraction(...result,unicodeFractions);
                }
                else {
                    return getFraction(...result,unicodeFractions);
                }
	    }
	}
	// If we failed, we just format...
	return n.toFixed(fallbackDigits);
    }
}

function fractify (decimal, divisor, approx=0.01) {
    /* Return fraction equivalent of decimal using divisor.
       If we don't have a fit, return none */
    var one_nth = 1/divisor // we have the one version...
    //console.log('one_nth=',one_nth);
    var numerator = decimal / one_nth;
    //console.log('numerator=',numerator);
    if (Math.abs(Math.round(numerator)-numerator) < approx) {
	return [Math.round(numerator),divisor]
    }
    else {
	return false
    }
}

// translation to javascript
/*We assume fractions look like this (I )?N/D */
function fracToFloat (s) {
    if (!s.split) {
        return Number(s); // if we are not a string, just use Number...
    }
    if (['/','D'].indexOf(s[s.length-1])>-1) {
        // if we end with a slash, we are not a number...
        return NaN
    }
    var parts = s.split(/\s+/);
    if (parts.length==2) {
	var num = Number(parts[0]);
	var frac = parts[1];
    }
    else {
	var num = 0;
	var frac = parts[0];
    }
    var frac_split = frac.split(/[\/D]/);
    if (frac_split.length==2) {
	return  num + (Number(frac_split[0])/Number(frac_split[1]))
    }
    else {
	// let's look for fraction unicode...
	for (var f of NUMBER_FRACTIONS) {
	    if (frac==f.word) {return num+(f.numerator/f.denominator)}
	}
    }
    // If we are still here, let's just try a regular conversion
    if (s.match(/[0-9]([,][0-9][0-9][0-9])+([.][0-9]+)?$/)) {
        s = s.replace(/[,]/g,'')
    }
    if (s.match(/[0-9]([.][0-9][0-9][0-9])+([,][0-9]+)?$/)) {
        s = s.replace(/[.]/g,'');
    }
    let val = Number(s)
    if (!isNaN(val)) {
        return val
    }
    else {
        let wordValue = getValueFromNumberWord(s)
        if (wordValue) {
            return wordValue
        }
    }
}

function getFrac (s) {
	let m = s.match(/\/([0-9]+)/);
	if (m) {
		return m[1];
	}
	else {
		return 1
	}
}


export {floatToFrac, fracToFloat, getFrac
        //firstRangeGroup, secondRangeGroup,
       }
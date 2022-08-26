/**
 * @author Max Aitkenhead 
 * Script to build the dynamic content for the BSLM conference programme.
 */

'use strict';

/*
* Template state enum used to tell the addElement() function to update either currentDayElement or currentSessionElement
*/
const ts = {
    NEW_DAY: 'new_day',
    NEW_SESSION: 'new_session'
}

/**
 * Converts a string template into an HTML element and injects it into the DOM.  
 * Creates a dummy outer div which has the innerHTML set, then the div is removed 
 * leaving only the HTML from the template.
 * Also keeps currentDayElement and currentSessionElement vars up to date.
 * @param {DOM Object} parent of which to add new element to
 * @param {String} template - String template to be converted to DOM object
 * @param {Array[String]} csvLine - Array of values representing one line of the CSV
 */

const addElement = (parent, template, csvLine) => {
    const element = document.createElement('div');
    parent.appendChild(element);
    element.innerHTML = template(csvLine);
    element.replaceWith(element.firstChild);
}

const filterCsv = csvArray => {
    const removeShortLines = arr => arr.filter(line => line.length > 1);
    const trimWhiteSpace = arr => arr.map(line =>  line.map(item => item.trim()));
    return removeShortLines(trimWhiteSpace(csvArray));
};

const findLatestElement = id => [...document.getElementsByClassName(id)].at(-1);

const buildProgramme = csvArray => {
    const filteredCsvArray = filterCsv(csvArray);

    filteredCsvArray.forEach(csvLine => {
        switch (csvLine[1]) {
            case 'day':
                return addElement(document.getElementById('dynamicContent'), dayTemplate, csvLine);
            case 'break':
                return addElement(findLatestElement('day'), sessionTemplate('intermission'), csvLine);
            case 'plenary session':
                return addElement(findLatestElement('day'), sessionTemplate('plenary'), csvLine);
            case 'main session':
                return addElement(findLatestElement('day'), sessionTemplate('parallel'), csvLine);
            case 'parallel session':
                return addElement(findLatestElement('day'), sessionTemplate('parallel'), csvLine);
            case 'speaker':
                return addElement(findLatestElement('session'), speakerTemplate, csvLine);
        }
    })

    const activityHeader = filteredCsvArray.find(csvLine => csvLine[1] === 'activity area')
    addElement(document.getElementById('dynamicContent'), dayTemplate, activityHeader);
        
    

    filteredCsvArray.forEach(csvLine => { 
        switch (csvLine[1]) {
            case 'activity day':
                return addElement(findLatestElement('day'), activityDayTemplate, csvLine);
            case 'activity':
                return addElement(findLatestElement('session'), speakerTemplate, csvLine);
        }
    })

    
    filteredCsvArray.forEach(csvLine => {
        switch (csvLine[1]) {
            case 'sponsorday':
                return addElement(document.getElementById('dynamicContent'), dayTemplate, csvLine);
            case 'sponsor logo':
                return addElement(findLatestElement('sponsorLogoArea'), sponsorLogoTemplate, csvLine);
            case 'small sponsor area':
                return addElement(findLatestElement('daySponsor'), smallSponsorAreaTemplate, csvLine);
            case 'full sponsor area':
                return addElement(findLatestElement('day'), fullSponsorAreaTemplate, csvLine);
        }
    })
    
};




const newTab = url => window.open(url, '_blank').focus();


const loadCsv = async () => {
    const response = await fetch('../online\ programme.csv');
    const text = await response.text();
    const csvArray = csvSplit(text);
    buildProgramme(csvArray);
    initScrollSpy();
}
loadCsv();


/**
 * Takes a CSV and splits by new lines and commas.  Commas wrapped by double quotes are ignored.  
 * @param {String} csvText - The raw text from the csv file
 * @returns {String} 2D array of lines and cols
 */
const csvSplit = csvText => {
    const csvLines = csvText.split('\n');
    const csvArray = csvLines.map(csvLine => {
        // if no double quotes exist, just return the line split by commas
        if (csvLine.indexOf('"') === -1) return csvLine.split(',');

        /**
         * In the string, areas in which commas are to be ignored are delimited by double quotes (").  This function creates 
         * tuples of indices of double quotes found in the string.  Each tuple represents the start and finish indices of 
         * the substring where commas should be ignored.  
         * Double quotes are escapped in Excel with a another preceding double quote, so the function will ignore any double
         * double quotes in the string.   
         * @param {Int} lastIndex - The char index after the last quote, searches for the next quote start from this index
         * @param {Array[Int]} currentTuple - Holds tuple of indices of quotes which make up a substring where commas are ignored
         * @param {Array[Array[Int]]} accIndexList - List of quote tuples
         * @returns {Array[Array[Int]]} - List of quote index tuples.  
         */
        const recGetIndicesOfDoubleQuotes = (lastIndex, currentTuple, accIndexList) => {
            const nextQuoteIndex = csvLine.indexOf('"', lastIndex + 1);
            if (nextQuoteIndex === -1) return accIndexList;
            // if quote is escaped, skip
            if (csvLine.charAt(nextQuoteIndex + 1) === '"') 
                return recGetIndicesOfDoubleQuotes(nextQuoteIndex + 1, currentTuple, accIndexList);
            // if the current tuple is empty, start a new tuple
            if (!currentTuple.length) return recGetIndicesOfDoubleQuotes(nextQuoteIndex, [nextQuoteIndex], accIndexList)
            // if the current tuple is complete, add it to the list of tuples (accumulator)
            return recGetIndicesOfDoubleQuotes(nextQuoteIndex, [], [...accIndexList, [...currentTuple, nextQuoteIndex]])
        }
        // last index given as -1 so that it starts searching at 0
        const quoteIndexTuples = recGetIndicesOfDoubleQuotes(-1, [], []);
        // if any tuples have an odd number then a double quote exists in the string that needs to be removed
        quoteIndexTuples.forEach(quoteTuple => {
            if (quoteTuple.length % 2 !== 0) throw 'rogue quote needs to be removed';
        })

       
         
        /**
         * Builds the csv line array from the csv line text and it's tuples array.  It assumes that each tuple is preceded 
         * by some unquoted text (split by commas) and after all of the tuples there is a last bit of unquoted text.  For each tuple
         * the unquoted text and the quoted text is identified, formatted seperately then combined in the accumulator array. 
         * After all of the tuples have been used, the final peice of unquoted text is formatted and added.     
         * @param {Array[Array[Int]]} quoteTuples - List of quote index tuples
         * @param {Array[String]} accArr - Accumulator for the final csv line array
         * @param {Int} startPos - Index to start after the last tuple
         * @returns 
         */
        const recBuildArray = (quoteTuples, accArr = [], startPos = 0) => {
            if (!quoteTuples.length) return [...accArr, ...unQuotedTextFormat(startPos, csvLine.length, csvLine)];
            const unQuotedText = unQuotedTextFormat(startPos, quoteTuples[0][0], csvLine);
            const quotedText = quotedTextFormat(quoteTuples[0][0], quoteTuples[0][1], csvLine);
            return recBuildArray(quoteTuples.slice(1), [...accArr, ...unQuotedText, quotedText], quoteTuples[0][1] + 1)
        }
        return recBuildArray(quoteIndexTuples);
    })
    return csvArray;
}

const unQuotedTextFormat = (startPos, endPos, csvLine) => {
    const substr = str => str.substring(startPos, endPos);
    const removeTrailingCommas = str => str.replace(/,+$/gm, '');
    const split = str => str.split(',');
    const removeEmptyFirstSpot = arr => arr[0] === '' ? arr.slice(1) : arr;
    return removeEmptyFirstSpot(split(removeTrailingCommas(substr(csvLine))));
}

const quotedTextFormat = (startPos, endPos, csvLine) => {
    const substr = str => str.substring(startPos, endPos);
    const removeQuotes = str => str.substring(1);
    const removeDoubleQuotes = str => str.replace(/""/gm, '"');
    return removeDoubleQuotes(removeQuotes(substr(csvLine)));
}


const resizeUpdates = () => {
    [...document.getElementsByClassName('sponsorLogoArea')].forEach(logoArea => {
        [...logoArea.getElementsByClassName('sponsorLogo')].forEach((logo, i, logoAreaArr) => {
            if (document.body.offsetWidth > 750)
                logo.style.maxWidth = `calc(${100 / logoAreaArr.length}% - 40px)`;
            else
                logo.style.maxHeight = `calc(${100 / (logoAreaArr.length + 1)}% - 10px)`;

        })
    })
}

// resizeUpdates();
// window.setTimeout(resizeUpdates, 500);
// window.setTimeout(resizeUpdates, 1000);
// window.setTimeout(resizeUpdates, 5000);



/**
 * @author Max Aitkenhead
 * Dom element templates
 */

'use strict';

const dayTemplate = csvLine => `<div id="${csvLine[5]}" class="day">
        <div class="daySponsor"></div>
        <div class="dayLabel">${csvLine[0]}</div>
    </div>`;


/**
 * Curried to pre select the session type before passing in the values
 */
const sessionTemplate = className => csvLine => {
    const optionalChair = csvLine[2].trim() !== '' ? `- Chair ${csvLine[2]}` : '';
    const hr = className !== 'intermission' ? '<hr>' : '';
    return `<div class="${className} session">
        <div class="label">
            <span class="label_time">${csvLine[3]} - ${csvLine[4]}</span> 
            <span class="wrap_label_info">
                <span class="label_name">${csvLine[0]}</span>
                <span class="label_chair">${optionalChair}</span>
            </span>
        </div>
        ${hr}
    </div>`;
}


const speakerTemplate = csvLine =>
    `<div class="speaker">
        <div class="speakerTime">
            ${csvLine[3]} - ${csvLine[4]}
        </div>
        <div class="speakerText">
            <b>${csvLine[0]}</b> - ${csvLine[2]}
            <div class="speakerTitle">${csvLine[5]}</div>
        </div>
    </div>`;


const activityDayTemplate = csvLine =>
    `<div class="activityDay session">
        <div class="label">
            <span class="wrap_label_info">
                <span class="label_name">${csvLine[0]}</span>
            </span>
        </div>
        <hr>
    </div>`;


const smallSponsorAreaTemplate = csvLine =>
    `<div class="smallSponsorArea session notSponsorArea">
        <div class="sponsorHeading">
            <p>Sponsored by</p>
        </div>
        <div class="sponsorLogoArea"></div>
    </div>`;


const fullSponsorAreaTemplate = csvLine =>
    `<div class="fullSponsorArea session sponsorLogoArea"></div>`;
    

const sponsorLogoTemplate = csvLine =>
    `<img class="sponsorLogo" src="${csvLine[5]}" onclick="newTab('${csvLine[2]}')">`;
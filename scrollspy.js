/**
 * @author Max Aitkenhead
 * Script to manage scroll animations in BSLM conference programme
 */
'use strict';

/**
 * Get relevant DOM Objects
 */
const bannerImg = document.getElementById('banner_img');
const bannerInfo = document.getElementById('banner_info');
const stickyNav = document.getElementById('sticky_nav');
const stickyDays = document.getElementById('sticky_days');
// const sections = document.querySelectorAll('section')
/**
 * Init other vars
 */
const windowHeight = window.innerHeight;
const windowHeightOpacity = windowHeight * 0.8;

/**
 * On scroll event listener - dont put too much stuff in here as it runs a lot
 */
document.addEventListener('scroll', e => {
    // get current scroll position
    const scrollyPos = window.scrollY;

    /**
     * Background opacity
     * If the page hasn't scrolled a full window
     * Opacity of background is set to percentage of scroll
     * If the page has been scrolled past the first window then opacity sets to 0.2
     */
    if (scrollyPos < windowHeight) {
        const newOpacity = 1 - (0.8 * scrollyPos / windowHeight);
        const roundedOpacity = Math.round(newOpacity * 100) / 100;
        bannerImg.style.opacity = `${roundedOpacity}`;
    } else {
        bannerImg.style.opacity = '0.2';
    }

    /**
     * Sticky nav bar
     * Get height at which nav bar should stop being sticky based on screen size
     * If above this height set as 'relative'
     * if below this heightnset as 'fixed'
     */
    const stickyScrollLength = (scrollyPos + stickyNav.offsetHeight + bannerInfo.offsetHeight);
    if (stickyScrollLength > windowHeight) {
        stickyNav.style.position = 'relative';
        stickyNav.style.top = `${windowHeight - stickyNav.offsetHeight - bannerInfo.offsetHeight}px`;
    } else {
        stickyNav.style.position = 'fixed';
        stickyNav.style.top = '0';
    }

    /**
     * Sticky day selection nav
     * Get height 
     */

    if (scrollyPos + stickyDays.offsetHeight > windowHeight) {
        stickyDays.style.left = '0';
        stickyDays.style.position = 'fixed';
        stickyDays.style.top = '0';
        stickyDays.style.width = '100%';
        stickyDays.style.backgroundColor = 'rgba(56, 165, 165, 0.9)';
        stickyDays.classList.add('phone_show_sticky_days');
    }
    else {
        stickyDays.style.position = 'relative';
        stickyDays.style.width = '70%';
        stickyDays.style.backgroundColor = 'rgba(56, 165, 165, 0.6)';
        stickyDays.classList.remove('phone_show_sticky_days');
    }
});

const addDynamicEventListener = () => {
    const days = [...document.getElementsByClassName('day')].map(day => ({
        element: day,
        topHeight: day.offsetTop,
        clientHeight: day.clientHeight,
        buttonElement: document.getElementsByClassName(day.id)[0]
    }));
    let previousCurrentDay = '';

    document.addEventListener('scroll', e => {
        const currentDay = days.find(day => window.scrollY < day.topHeight + day.clientHeight 
            && window.scrollY > day.topHeight);
        if ((currentDay !== previousCurrentDay) || currentDay.topHeight !== previousCurrentDay.topHeight) {
            previousCurrentDay = currentDay;
            days.forEach(day => {
                if (day.buttonElement !== undefined) day.buttonElement.classList.remove('active');
            });
            if (window.scrollY < days[0].topHeight) days[0].buttonElement.classList.remove('active')
            if (currentDay !== undefined) currentDay.buttonElement.classList.add('active');
        }
    })
}


const scrollToId = id => document.getElementById(id).scrollIntoView({
    behavior: "smooth",
    block: "start",
    inline: "nearest"
});


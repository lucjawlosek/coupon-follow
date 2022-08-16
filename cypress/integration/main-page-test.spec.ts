import mainPage from '../support/pages/main-page'

describe('Main page tests', () => {
    beforeEach(() => {
        mainPage.visit()
    });

    it('1. Validate that 3 out of 6 or 9 total Top Deal coupons are displayed', () => {
        mainPage.topCoupons()
            .filter(':visible')
            .should('have.length', 3)
    });

    it('2. Validate that at least 30 Today’s Trending Coupons ' +
        'are displayed on the main page', () => {
        mainPage.trendingCoupons()
            .should('be.visible')
            .and('have.length.above', 30)
    });

    it('3. Validate that Staff Picks contains unique stores ' +
        'with proper discounts for monetary, percentage or text values', () => {
        //perform actions on each staff coupon element
        mainPage.staffPicks()
            .each(($el) => {
                const staffPick = cy.wrap($el)
                staffPick
                    .children()
                    .eq(0)
                    .invoke('attr', 'data-sitename')
                    .then((domainName) => {
                        mainPage.staffPicks()
                            .filter(`:contains("${domainName}")`)
                            // assert that there's only one element with this store name
                            .should('have.length', 1)
                    })

                staffPick
                    .find('.title')
                    .invoke('text')
                    .then((text) => {
                        if (text.includes('$')) {
                            // regex is probably incomplete - I'm not sure how high the discount may be
                            // so I only included cases I saw on the page
                            expect(text).to.match(/Take \$([1-9]|[1-9][0-9]|[1-9][0-9][0-9]) Off/g)
                        } else if (text.includes('%')) {
                            expect(text).to.match(/Save ([1-9]|[1-9][0-9])% Off/g)
                        } else {
                            expect(text).to.be.oneOf(['Free Shipping', 'On Sale!'])
                        }
                    });
            });
    });

    it('4. If applicable (there are more than 3 Top Deal coupons) - ' +
        'Validate that the Top Deal swiper is automatically changed every 5 seconds', () => {
        mainPage.topCouponsBullets()
            .then((bullets) => {
                if (bullets.length < 3) {
                    cy.checkIfVisibleTopCouponElementHasClass(1, mainPage.topCouponsClassPrev)
                    cy.checkIfVisibleTopCouponElementHasClass(2, mainPage.topCouponsClassActive)
                    cy.checkIfVisibleTopCouponElementHasClass(3, mainPage.topCouponsClassNext)
                    // wait for a change in the swiper
                    cy.checkIfVisibleTopCouponElementHasClass(3, mainPage.topCouponsClassActive)
                        .then(() => {
                            // check the time right after the first change
                            const t0 = Date.now();
                            cy.checkIfVisibleTopCouponElementHasClass(3, mainPage.topCouponsClassPrev)
                                .then(() => {
                                    //check the time after the second change and compare it to the last timestamp
                                    const t1 = Date.now();
                                    const topCouponsChangeTime = ((t1 - t0) / 1000);
                                    expect(topCouponsChangeTime).to.be.at.least(5)
                                });
                        });
                } else {
                    const topCouponsNumber = bullets.length
                    cy.log(`There are only ${topCouponsNumber} Top Coupons and swiper doesn't change`)
                }
            })
    });
});
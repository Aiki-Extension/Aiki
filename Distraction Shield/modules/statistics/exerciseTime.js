import * as storage from '../storage/storage'
import * as dateutil from '../dateutil'

/**
 * Increments the counter for time spent on exercises today with 'amount'.
 * When there the current day does not exist in the storage yet, initialize the counter for this day at 0.
 * @param {int} amount the amount of seconds to be added to the current date
 * @module exerciseTime
 */
export function incrementTodayExerciseTime(amount) {
    storage.getExerciseTimeList().then((list) => {
        let todayDate = dateutil.getToday();
        let today = list.find((record) => record.date == todayDate);
        if (typeof today === 'undefined') {
            list.push({date: todayDate, timeSpent: amount});
        } else {
            today.timeSpent += amount;
        }
        return list;
    }).then((list) => {
        storage.setExerciseTimeList(list);
    });
}
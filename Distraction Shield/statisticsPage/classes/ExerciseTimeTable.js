import * as dateutil from "../../modules/dateutil"
import BasicTable from "./BasicTable"

/**
 * Table which is used to display the amount of time the user
 * has spent on exercises on the Zeeguu page.
 * @constructs ExerciseTimeTable
 * @class
 * @augments BasicTable
 */
export default class ExerciseTimeTable extends BasicTable {

    /**
     * This functions generates an HTML row containing the icon, name, counter & timespent of one {@link BlockedSite}
     * @param item item containing the date + time spent on exercises
     * @return {JQuery|jQuery|HTMLElement} HTML row from the data
     * @function BlacklistStatsTable#generateTableRow
     * @memberof! ExerciseTimeTable
     */
    generateTableRow(item) {
        return $("<tr>" +
            "<td>" + item.date + "</td>" +
            "<td>" + dateutil.msToHHMMSS(item.timeSpent) + "</td>" +
            "</tr>");
    }
}
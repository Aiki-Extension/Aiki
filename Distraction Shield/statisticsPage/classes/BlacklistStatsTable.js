import * as dateutil from "../../modules/dateutil"
import BasicTable from "./BasicTable"

/**
 * Table which is used to display data about the amount of interception a user has, and the amount of time the user
 * has spent on a certain blacklisted website.
 * @constructs BlackListStatsTable
 * @class
 * @augments BasicTable
 */
export default class BlacklistStatsTable extends BasicTable {
    /**
     * This functions generates an HTML row containing the icon, name, counter & timespent of one {@link BlockedSite}
     * @param {BlockedSite} site a BlockedSite of which the data is used
     * @return {JQuery|jQuery|HTMLElement} HTML row from the data
     * @function BlacklistStatsTable#generateTableRow
     * @override
     */
    generateTableRow(site) {
        return $("<tr class='table-row' >" +
            "<td>" + site.icon + "</td>" +
            "<td>" + site.name + "</td>" +
            "<td>" + site.counter + "</td>" +
            "<td>" + dateutil.msToHHMMSS(site.timeSpent) + "</td>" +
            "</tr>");
    }
}



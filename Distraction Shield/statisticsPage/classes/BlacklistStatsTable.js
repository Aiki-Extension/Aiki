import * as dateutil from "../../modules/dateutil"
import BasicTable from "./BasicTable"

/**
 * Table which is used to display data about the amount of interception a user has, and the amount of time the user
 * has spent on a certain blacklisted website.
 */
export default class BlacklistStatsTable extends BasicTable {

    /**
     * This functions generates HTML rows containing data of one BlockedSite
     * @param site a BlockedSite of which the data is used
     * @return string containing a HTML row
     */
    generateTableRow(site) {
        return $("<tr class='table-row' >" +
            "<td>" + site.icon + "</td>" +
            "<td>" + site.name + "</td>" +
            "<td>" + site.counter + "</td>" +
            "<td>" + dateutil.secondsToHHMMSS(site.timeSpent) + "</td>" +
            "</tr>");
    }
}



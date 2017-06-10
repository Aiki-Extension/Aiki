import BasicTable from "./BasicTable"

/**
 * Table which is used to display the total amount of times the user has been intercepted in the past
 * day, week and month.
 * @constructs InterceptionCounterTable
 * @class
 * @augments BasicTable
 */
export default class InterceptionCounterTable extends BasicTable {

    /**
     * This function renders the data to the screen in the correct format.
     * @function InterceptionCounterTable#render
     * @override
     */
    render(data) {
        $('#countDay').text(data.countDay);
        $('#countWeek').text(data.countWeek);
        $('#countMonth').text(data.countMonth);
        $('#countTotal').text(data.countTotal);
    }
}






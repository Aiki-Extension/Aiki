
export default class BasicTable {

    /**
     * Abstract Class for rendering {@link BlockedSiteList} data to tables
     * @param html_element table element to fill with data
     * @abstract
     * @constructs BasicTable
     * @class
     */
    constructor(html_element) {
        this._html_element = html_element;
    }

    /**
     * Removes old tablerow elements, leaving only the header, to fill the table with data.
     * @param data {BlockedSiteList} to fill the table with
     * @function BasicTable#createTable
     */
    createTable(data) {
        this._html_element.find('tr:not(:has(th))').remove();
        this._html_element.append(data.map(this.generateTableRow));
    }

    /**
     * Constructs a table row element from a BlockedSite
     * @param dataElement {BlockedSite}
     * @returns {JQuery|jQuery|HTMLElement} table row element
     * @function BasicTable#generateTableRow
     */
    generateTableRow(dataElement) {
        return $("<tr class='table-row'></tr>");
    }

    /**
     * Use this function to render data in the table.
     * @param data {BlockedSiteList} BlockedSiteList to render
     * @function BasicTable#render
     */
    render(data) {
        this.createTable(data);
    }
}
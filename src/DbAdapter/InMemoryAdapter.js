import Adapter from "./Adapter";

/**
 * InMemoryAdapter class
 */
export default class InMemoryAdapter extends Adapter {
    /**
     * InMemoryAdapter constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.items = [];
    }

    /**
     * Method to get all items
     * @returns {[]|*[]}
     */
    getAllItems(){
        return this.items;
    }

    /**
     * Method to slice top most element
     */
    remove(){
        // const index = this.items.findIndex(obj => obj.id == id);
        this.items.shift();
    }

    /**
     * Method to add item
     * @param item
     */
    addItem(item){
        this.items.push(item);
    }

    /**
     * Method to get length
     * @returns {number}
     */
    getLength(){
        return this.items.length;
    }

    /**
     * Method to get top element
     * @returns {*}
     */
    getTopItem(){
        return this.items[0];
    }
}

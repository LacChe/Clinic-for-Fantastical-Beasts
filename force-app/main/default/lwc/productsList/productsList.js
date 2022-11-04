import { LightningElement, wire, track } from 'lwc';
import getStandardProducts from '@salesforce/apex/RecordController.getStandardProducts';

export default class ProductsList extends LightningElement {

    selectedProducts;
    products = [];
    
    error;

    @track columns = [
        {
            label: 'Name',
            fieldName: 'nameUrl',
            type: 'url',
            typeAttributes: {label: { fieldName: 'Name' }, 
            target: '_blank'},
            sortable: true
        },
        {
            label: 'Cost',
            fieldName: 'UnitPrice',
            type: 'currency',
            sortable: true
        }
    ];

    @wire(getStandardProducts)
    wiredProducts(result) {
        const { data, error } = result;
        if(data) {
            let nameUrl;
            this.products = data.map(row => { 
                nameUrl = `/${row.Id}`;
                return {...row , nameUrl} 
            });
            this.error = null;
        }
        if(error) {
            this.error = error;
            this.products = [];
        }
    }
    
    rowSelection(event){
        this.selectedProducts = event.detail.selectedRows;
        const productSelection = new CustomEvent('productselection', { 
            detail: {
                products: this.selectedProducts,
            }
        });
        this.dispatchEvent(productSelection);
    }

}
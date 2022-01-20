export class ExcelColumn {
    col_name: string = '';
    col_header: string = '';
    data_type: string = 'string';

    constructor(
        name: string,
        header: string,
        type: string='string') {
        this.col_name = name;
        this.col_header = header;
        this.data_type = type;
    }

}
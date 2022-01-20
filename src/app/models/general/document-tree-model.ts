export class DocumentTreeModel {
    id: string;
    name: string;
    children: Array<DocumentTreeModel>;
    count: number = 0;

    constructor(id: string, name: string, children: Array<DocumentTreeModel>, count: number) {
        this.id = id;
        this.name = name;
        this.children = children;
        this.count = count;
    }
}
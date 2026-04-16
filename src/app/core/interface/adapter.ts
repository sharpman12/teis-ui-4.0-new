
export default interface Adapter<T> {
    adapt(item: any): T;
}

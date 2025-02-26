import { Timestamp as FirebaseTimestamp } from 'firebase/firestore';

declare module 'firebase/firestore' {
    interface Timestamp extends FirebaseTimestamp { }
}

declare module '*.svg' {
    const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
    export default content;
}

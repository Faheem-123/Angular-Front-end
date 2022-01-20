export const chartColors = {
     red: 'rgb(255, 99, 132)',
    // orange: 'rgb(255, 159, 64)',
    // yellow: 'rgb(255, 205, 86)',
    // green: 'rgb(45, 192, 45)',
    // blue: 'rgb(54, 162, 235)',
    // darkblue: 'rgb(24, 42, 75)',
    // purple: 'rgb(153, 102, 255)',
    // grey: 'rgb(231,238,235)',
    // darkgrey: 'rgb(81,88,85)',
    // black: 'rgb(20,20,20)',
    // white: 'rgb(255,255,255)',
    Second:'#14a75d',
    Fifth:'#d29120',
    Tenth:'#7e57c2',
    TwentyFive:'#2e80c2',
    Fifty:'#e06021',
    SeventyFive:'#26a69a',
    EightFive:'#ab47bc',
    Ninty:'#7cdc95',
    NintyFive:'#607d8b',
    NintyEight:'#CB2927',
    patient:'#3871a7'
  };
  
  export interface DataSeries {
    index: number;
    axisId: '2nd' | '5th' |'10th'|'25th'|'50th'|'75th'|'90th'|'95th'|'98th' | 'weight';
    label: string;
    colorName: keyof typeof chartColors;
    units: 'celsius' | 'fahrenheit';
    activeInBypassMode: boolean;
    remoteData?: any;
    position:string;
  }
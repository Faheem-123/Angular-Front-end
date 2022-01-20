export class ORMSaveChartProblem {
    problem_id: number;
    patient_id: number;
    chart_id: number;
    practice_id: number;
    prob_date: string;
    code_type: string;
    diag_code: string;
    diag_description: string;
    comments: string;
    status: string;
    resolved_date: string;
    created_user: string;
    client_date_created: string;
    modified_user: string;
    client_date_modified: string;
    date_created: string;
    date_modified: string;
    system_ip: string;
    diag_type: string;
    primary_diag: boolean;
    chronic: boolean;
    acute: boolean;
    screening: boolean;
    education_provided: boolean;
    from_followup:boolean;
    problem_type:string;
}
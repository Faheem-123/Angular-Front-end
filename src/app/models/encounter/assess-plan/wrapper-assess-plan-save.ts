import { ORMAssessPlanSave } from "./orm-assess-plan-save";
import { ORMAssessPlanAssessmentSave } from "./orm-assess-plan-assessment-save";
import { ORMAssessPlanOfTreatementSave } from "./orm-assess-plan-pot-save";

export class WrapperAssessPlanSave {
    assess_plan: ORMAssessPlanSave;
    lst_assess_plan_assessments: Array<ORMAssessPlanAssessmentSave>;
    lst_assess_plan_pot: Array<ORMAssessPlanOfTreatementSave>;
    lst_assess_plan_assessments_deleted_ids: Array<number>;
    lst_assess_plan_pot_deleted_ids: Array<number>;

    constructor(assPlanMan: ORMAssessPlanSave, lstAssessment: Array<ORMAssessPlanAssessmentSave>,
        lstPOT: Array<ORMAssessPlanOfTreatementSave>, lstAssessmentDelIds: Array<number>, lstPOTDeletedIds: Array<number>
    ) {

        this.assess_plan = assPlanMan;
        this.lst_assess_plan_assessments = lstAssessment;
        this.lst_assess_plan_pot = lstPOT;
        this.lst_assess_plan_assessments_deleted_ids = lstAssessmentDelIds;
        this.lst_assess_plan_pot_deleted_ids = lstPOTDeletedIds;
    }
}
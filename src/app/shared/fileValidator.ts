import {Directive} from "@angular/core";
import {NG_VALIDATORS, Validator, FormControl} from "@angular/forms";

@Directive({
    selector: "[requiredFile]",
    providers: [
        { provide: NG_VALIDATORS, useExisting: FileValidator, multi: true },
    ]
})
export class FileValidator implements Validator {
    static validate(c: FormControl): {[key: string]: any} {
        //debugger;        
        
        if(c.value == null || c.value.length == 0)
            return { "required" : true}
        else
        {
            return null;
        }
        //return c.value == null || c.value.length == 0 ? { "required" : true} : null;
    }

    validate(c: FormControl): {[key: string]: any} {
        return FileValidator.validate(c);
    }
}
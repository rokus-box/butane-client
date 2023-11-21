import { Component, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VaultService } from '../../services/vault.service';
import {
  ClassValidatorFormArray,
  ClassValidatorFormControl,
  ClassValidatorFormGroup,
} from 'ngx-reactive-form-class-validator';
import { getFirstError } from '../../helpers/getFirstError';
import { IsOptional, Length, MaxLength, ValidateIf } from 'class-validator';
import { Vault } from '../../services/in-memory.service';
import { map, Subject } from 'rxjs';
import { generatePassword } from '../../helpers/generatePassword';
import { MatSnackBar } from '@angular/material/snack-bar';

export class CreateSecretForm {
  @Length(2, 32, { message: 'Must be between 2 and 32 characters' })
  display_name: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== '')
  @Length(2, 255, { message: 'Must be between 2 and 255 characters' })
  uri: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== '')
  @MaxLength(255, { message: 'Cannot exceed 255 characters' })
  username: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== '')
  @MaxLength(255, { message: 'Cannot exceed 255 characters' })
  password: string;
}

export class CreateMetadatumForm {
  @Length(2, 32, { message: 'Must be between 2 and 32 characters' })
  key: string;

  @Length(2, 255, { message: 'Must be between 2 and 255 characters' })
  value: string;
}

@Component({
  selector: 'app-create-secret',
  templateUrl: './create-secret.component.html',
  styleUrls: ['./create-secret.component.scss'],
})
export class CreateSecretComponent implements OnDestroy {
  protected readonly getFirstError = getFirstError;

  loading = false;
  //This is a hacky way to get templates to get typings

  formGroups: ClassValidatorFormGroup[] = [];
  createSecretForm = new ClassValidatorFormGroup(CreateSecretForm, {
    display_name: new ClassValidatorFormControl(''),
    uri: new ClassValidatorFormControl(''),
    username: new ClassValidatorFormControl(''),
    password: new ClassValidatorFormControl(''),
    metadata: new ClassValidatorFormArray([]),
  });

  invalid$: Subject<any>;

  constructor(
    private vaultService: VaultService,
    private ref: MatDialogRef<CreateSecretComponent>,
    private snack: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: Vault,
  ) {
    this.invalid$ = new Subject();
    this.createSecretForm.statusChanges
      .pipe(map((status) => status === 'INVALID'))
      .subscribe(this.invalid$);
  }

  ngOnDestroy() {
    this.invalid$.unsubscribe();
  }

  async createSecret() {
    this.createSecretForm.disable();
    this.loading = true;
    await this.vaultService.createSecret(
      this.data.id,
      this.createSecretForm.value,
    );
    this.ref.close(true);
  }

  async addMetadatumForm() {
    if (this.formGroups.length > 4) {
      return;
    }

    const fg = new ClassValidatorFormGroup(CreateMetadatumForm, {
      key: new ClassValidatorFormControl(),
      value: new ClassValidatorFormControl(),
      type: new ClassValidatorFormControl(0),
    });

    this.createSecretForm.controls.metadata.push(fg);
    this.formGroups.push(fg);
    this.invalid$.next(true);
  }

  removeMetadatum($event: MouseEvent, index: number) {
    $event.stopPropagation();
    this.createSecretForm.controls.metadata.removeAt(index);
    this.formGroups.splice(index, 1);
  }

  genPass() {
    const charset = localStorage.getItem('chars');
    const charsLength = localStorage.getItem('charsLength');

    if (charset && charsLength) {
      this.createSecretForm.controls.password.setValue(
        generatePassword(charset, +charsLength),
      );
    } else {
      this.snack.open(
        'Please correct your password settings first',
        'Dismiss',
        {
          duration: 5000,
        },
      );
    }
  }
}

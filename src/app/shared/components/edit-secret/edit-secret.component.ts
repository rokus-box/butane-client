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
import { Metadatum, Secret } from '../../services/in-memory.service';
import { map, Subject } from 'rxjs';
import { generatePassword } from '../../helpers/generatePassword';
import { MatSnackBar } from '@angular/material/snack-bar';

export class EditSecretForm {
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

export class EditMetadatumForm {
  @Length(2, 32, { message: 'Must be between 2 and 32 characters' })
  key: string;

  @Length(2, 255, { message: 'Must be between 2 and 255 characters' })
  value: string;
}

interface CustomFormGroup extends ClassValidatorFormGroup {
  removed: boolean;
  addedNew: boolean;
  controls: {
    key: ClassValidatorFormControl;
    value: ClassValidatorFormControl;
    type: ClassValidatorFormControl;
  };
}

@Component({
  selector: 'app-edit-secret',
  templateUrl: './edit-secret.component.html',
  styleUrls: ['./edit-secret.component.scss'],
})
export class EditSecretComponent implements OnDestroy {
  protected readonly getFirstError = getFirstError;

  loading = false;
  //This is a hacky way to get templates to get typings

  formGroups: CustomFormGroup[] = [];
  createSecretForm = new ClassValidatorFormGroup(EditSecretForm, {
    id: new ClassValidatorFormControl(this.data.secret.id),
    display_name: new ClassValidatorFormControl(this.data.secret.display_name),
    uri: new ClassValidatorFormControl(this.data.secret?.uri),
    username: new ClassValidatorFormControl(this.data.secret?.username),
    password: new ClassValidatorFormControl(this.data.secret?.password),
    metadata: new ClassValidatorFormArray([]),
  });
  isMobile = window.innerWidth < 768;
  invalid$: Subject<any>;

  constructor(
    private vaultService: VaultService,
    private ref: MatDialogRef<EditSecretComponent>,
    private snack: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { vaultId: string; secret: Secret },
  ) {
    this.data.secret.metadata?.forEach((metadatum) => {
      const fg = new ClassValidatorFormGroup(EditMetadatumForm, {
        key: new ClassValidatorFormControl(metadatum.key),
        value: new ClassValidatorFormControl(metadatum.value),
        type: new ClassValidatorFormControl(metadatum.type),
      });

      this.formGroups.push(
        Object.assign(fg, { removed: false, addedNew: false }),
      );
      this.createSecretForm.controls.metadata.push(fg);
    });

    this.data.secret.uri = this.data.secret?.uri ?? null;
    this.data.secret.password = this.data.secret?.password ?? null;
    this.data.secret.username = this.data.secret?.username ?? null;

    this.invalid$ = new Subject();
    this.createSecretForm.statusChanges
      .pipe(map((status) => status === 'INVALID'))
      .subscribe(this.invalid$);
  }

  ngOnDestroy() {
    this.invalid$.unsubscribe();
  }

  async editSecret() {
    if (null == this.data.secret.metadata) {
      this.data.secret.metadata = [];
    }

    const filtered = this.formGroups
      .filter((fg) => !fg.removed)
      .map((fg) => fg.value);

    if (this.createSecretForm.value.metadata?.length > 0) {
      this.createSecretForm.value.metadata = filtered;
    }

    if (this.deepEqual(this.data.secret, this.createSecretForm.value)) {
      this.ref.close();
      return;
    }

    this.createSecretForm.disable();
    this.loading = true;

    if (this.createSecretForm.value.metadata?.length > 0) {
      this.createSecretForm.value.metadata = filtered;
    }

    await this.vaultService.updateSecret(
      this.data.vaultId,
      this.createSecretForm.value,
    );
    this.ref.close(true);
  }

  async addMetadatumForm() {
    if (this.formGroups.length > 4) {
      return;
    }

    const fg = new ClassValidatorFormGroup(EditMetadatumForm, {
      key: new ClassValidatorFormControl(),
      value: new ClassValidatorFormControl(),
      type: new ClassValidatorFormControl(0),
    });

    fg.setErrors({});
    this.createSecretForm.controls.metadata.push(fg);
    this.formGroups.push(Object.assign(fg, { removed: false, addedNew: true }));

    // this.invalid$.next(true);
  }

  removeMetadatum($event: MouseEvent, index: number) {
    $event.stopPropagation();

    const fg = this.formGroups[index];

    if (fg.addedNew) {
      this.createSecretForm.controls.metadata.removeAt(index);
      this.formGroups.splice(index, 1);
    } else {
      fg.removed = !fg.removed;
      fg.removed ? fg.disable() : fg.enable();
    }
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

  deepEqual = (x: any, y: any): boolean => {
    if (x === y) {
      return true;
    } else if (
      typeof x == 'object' &&
      x != null &&
      typeof y == 'object' &&
      y != null
    ) {
      if (Object.keys(x).length != Object.keys(y).length) return false;

      for (let prop in x) {
        if (y.hasOwnProperty(prop)) {
          if (!this.deepEqual(x[prop], y[prop])) return false;
        } else return false;
      }

      return true;
    } else return false;
  };

  mdChanged(fg: CustomFormGroup, metadatum: Metadatum) {
    if (null == metadatum) {
      return false;
    }

    return (
      fg.controls.value.value !== metadatum.value ||
      fg.controls.key.value !== metadatum.key ||
      fg.controls.type.value !== metadatum.type
    );
  }
}

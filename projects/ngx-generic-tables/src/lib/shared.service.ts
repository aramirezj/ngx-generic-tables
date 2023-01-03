import { EventEmitter, inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { formatDate } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Dialog, DialogConfig } from '@angular/cdk/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { GTConfirmationComponent } from './components/confirmacion/confirmacion.component';



/** Servicio de utilidades para la aplicación */
@Injectable({ providedIn: 'root' })
export class SharedService {
    public tableIdCounter: number = 0;
    /** s */
    public menuContextualAbierto: EventEmitter<boolean> = new EventEmitter();
    ckDialog:Dialog = inject(Dialog);
    snackBar:MatSnackBar = inject(MatSnackBar);

    /**
     * Recupera un identificador de la tabla y le hace un mas uno
     *
     * @returns El id
     */
    getTableId(): number {
        return this.tableIdCounter;
    }

    /**
    * Function that shows a dialog with a message and some options (Accept/Cancelar)
    *
    * @param message Elemento del que se pide confirmación
    * @param options
    * @returns Observable del dialogo
    */
    showConfirmation(message: string, options?: string[]): Observable<any> {
        const dialogRef = this.ckDialog.open(GTConfirmationComponent, {
            width: '30vw',
            data: { message, options }
        })
        return dialogRef.closed;
    }


    /**
     * Apertura de un dialogo para un componente a recibir
     *
     * @param component Componente a invocar
     * @param data Datos a transmitir al componente
     * @param size Ancho de la ventana emergente
     * @param height Altura de la ventana emergente
     * @param directInject Si debe injectar atributos en el componente
     * @param disableClose Si debe deshabilitar el cierre clicando fuera
     */
    openGenericDialog(component: ComponentType<unknown>, data: any, size: string = 'fit-content', height: string = 'fit-content', disableClose?: boolean): Observable<any> {
        const dialogConfig = new DialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.data = data;
        dialogConfig.width = size;
        dialogConfig.maxWidth = size;
        dialogConfig.height = height;
        dialogConfig.maxHeight = height;
        dialogConfig.disableClose = disableClose ? disableClose : false;
        const dialogRef = this.ckDialog.open(component, dialogConfig as any);
        return new Observable(observer => {
            dialogRef.closed.subscribe(valor => {
                observer.next(valor);
                observer.complete();
            })
        });
    }




    /**
     * Función que busca en un listado un elemento repetido con claves primarias anidadas
     * @param datos Listado de datos
     * @param clavePrimaria Clave primaria compleja
     * @param elementoNuevo Elemento nuevo
     * @returns Si está repetido
     */
    findRepeatRecursivo(datos: any[], clavePrimaria: string, elementoNuevo: any) {
        const campos: string[] = clavePrimaria.split('.');
        let repetido: boolean = false;

        let PKEleNuevo = Object.assign({}, elementoNuevo);
        for (let i = 0; i < campos.length; i++) {
            PKEleNuevo = PKEleNuevo[campos[i]];
            if (!PKEleNuevo) break;
        }

        //Si su PK supuesta no está asignada, devolvemos que no está repetida
        if (!PKEleNuevo) return false;
        //Con esto tenemos el valor PK del elemento nuevo
        for (const dato of datos) {
            if (campos.length > 1) {
                let eleFinal = Object.assign({}, dato);
                for (let i = 0; i < campos.length; i++) {
                    eleFinal = eleFinal[campos[i]];
                    if (!eleFinal) break;
                }
                if (eleFinal === PKEleNuevo) repetido = true;
            }
        }
        if (repetido) this.openSnackBar('No se ha podido añadir el elemento, su clave está repetida', 3, 'error');
        return repetido;
    }


    /**
     * Función encargada de realizar las conversiones de las fechas
     *
     * @param date fecha a la que dar formato
     * @param locale parametro utilizado para decidir si se formatea al formato español o al requerido por el back
     */
    dateFormat(date: any, locale?: string): string {
        return locale === 'es' ? formatDate(date, 'dd/MM/yyyy', 'es-es') : formatDate(date, 'yyyy/MM/dd', 'es-es');
    }

    /**
     * Función encargada de realizar las conversiones de las fechas solo para el back
     *
     * @param date fecha a la que dar formato
     * @returns La fecha formateada
     */
    dateFormatBackend(date: any): string {
        return formatDate(date, 'yyyy-MM-dd', 'es-es');
    }

    /**
     * Función encargada de realizar las conversiones de las fechas
     *
     * @param date fecha a la que dar formato
     * @param locale parametro utilizado para decidir si se formatea al formato español o al requerido por el back
     * @returns La fecha formateada
     */
    dateTimeFormat(date: any, locale?: string): string {
        return locale === 'es' ? formatDate(date, 'dd/MM/yyyy HH:mm', 'es-es') : formatDate(date, 'yyyy-MM-ddTHH:mm:ss.SSS', 'es-es');
    }



    /**
     * Función que prepara la creación de notificaciones
     *
     * @param message Mensaje a mostrar
     * @param seconds Segundos que debe durar la notificación
     */
    openSnackBar(message: string, seconds: number, tipo?: string): void {
        const snackBarConfig: MatSnackBarConfig = new MatSnackBarConfig();

        snackBarConfig.duration = seconds * 1000;
        snackBarConfig.horizontalPosition = 'center';
        snackBarConfig.verticalPosition = 'bottom';
        snackBarConfig.panelClass = tipo === 'error' ? 'errorSnackbar' : 'customSnackbar';
        if (message && message !== '') {
            const openedSnackbar = this.snackBar._openedSnackBarRef;
            if (openedSnackbar && !tipo && openedSnackbar?.containerInstance?.snackBarConfig?.panelClass === 'customSnackbar') {
                // Detecta que ya hay una notificación mostrada, recoge su info y lanza una nueva concatenando la info
                const nuevoMensaje = `${openedSnackbar.instance.data.message}\n- ${message}`;
                snackBarConfig.duration += openedSnackbar.containerInstance.snackBarConfig.duration ?? 0;
                this.snackBar.open(nuevoMensaje, 'Cerrar', snackBarConfig);
            } else {
                this.snackBar.open('- ' + message, 'Cerrar', snackBarConfig);
            }
        }
    }


}

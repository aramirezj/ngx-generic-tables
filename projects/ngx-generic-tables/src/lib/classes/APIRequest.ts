/** Class used in execute api request from the generic form */
export class GF_APIRequest {
  constructor(
    /** Request to execute */
    public request: Function,
    /**Params that could need the query, it can be used the literal 'OBJECT' to pass the whole object. */
    public params: string[] = [],
    /** List of pair key value that will be setted in the element and can be used as params */
    public parametersToElement?: {},
    /** List of pair key value that can be used as params directly to the Path. They do no add information to the element */
    public parametersToPath?: {}
  ) { }

  /**
   * Function that returns in a list, the final results that should send the APIRequest
   * @param elemento Base element
   * @returns List of params of the api
   */
  prepareParams(elemento: any): any[] {
    // Listado de valores finales que se enviarán
    const valoresPeticion: any[] = [];
    // Si hay una serie de parametros con valores predeterminados, estos valores se asignan
    // al elemento base
    if (this.parametersToElement) {
      for (const key of Object.keys(this.parametersToElement)) {
        elemento[key] = this.parametersToElement[key];
      }
    }

    // Se leen los parametros definidos para esta petición
    for (const param of this.params) {
      // Si es de tipo OBJECT, como valor se añadirá el objeto entero
      if (param === 'OBJECT') {
        valoresPeticion.push(elemento);
      } else {
        // Si el atributo parametersToPath está seteado, en vez de añadir valores predeterminados al elemento,
        // se añaden a la petición difectamente
        if (this.parametersToPath) {
          if (param in this.parametersToPath) {
            valoresPeticion.push(this.parametersToPath[param]);
          } else {
            valoresPeticion.push(this.getParam(param, elemento));
          }
          // Valores base
        } else {
          valoresPeticion.push(this.getParam(param, elemento));
        }
      }
    }
    return valoresPeticion;
  }

  /**
   * Checks if the param is nested, if so, it retrieves it
   * @param model model
   * @param element element
   * @returns value ready to use
   */
  getParam(model: string, element: any): any {
    const splitted: string[] = model.split('.');
    let toReturn: any;
    if (splitted.length > 1) {
      toReturn = element[splitted[0]]?.[splitted[1]];
    } else {
      toReturn = element[model];
    }
    return toReturn;
  }
}

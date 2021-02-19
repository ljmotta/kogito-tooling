/*
 * Copyright 2020 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Ajv from "ajv";
import { JSONSchemaBridge } from "uniforms-bridge-json-schema";
import { Schema } from "ajv";

export interface JitDmnPayload {
  model: string;
  context: Map<string, object>;
}

const JIT_DMN_SERVER = "http://localhost:8080/";
const JIT_DMN_URL = "http://localhost:8080/jitdmn";
const JIT_DMN_SCHEMA_URL = "http://localhost:8080/jitdmn/schema";
const JIT_DOWNLOAD = "https://kiegroup.github.io/kogito-online-ci/temp/runner.zip";

export const ajv = new Ajv({ allErrors: true, useDefaults: true });
// AjvErrors(ajv);

export const schema = {
  definitions: {
    OutputSet: {
      type: "object",
      properties: {
        "Front End Ratio": { $ref: "#/definitions/Front_End_Ratio" },
        "Back End Ratio": { $ref: "#/definitions/Back_End_Ratio" },
        "Credit Score Rating": { $ref: "#/definitions/Credit_Score_Rating" },
        "Loan Pre-Qualification": { $ref: "#/definitions/Loan_Qualification" },
        "Credit Score": { $ref: "#/definitions/Credit_Score" },
        "Applicant Data": { $ref: "#/definitions/Applicant_Data" },
        "Requested Product": { $ref: "#/definitions/Requested_Product" }
      },
      "x-dmn-type": "DMNType{ https://kiegroup.org/dmn/_857FE424-BEDA-4772-AB8E-2F4CDDB864AB : OutputSet }"
    },
    Loan_Qualification: {
      type: "object",
      properties: {
        Qualification: { $ref: "#/definitions/Loan_Qualification_Qualification" },
        Reason: { type: "string", "x-dmn-type": "FEEL:string" }
      },
      "x-dmn-type": "DMNType{ https://kiegroup.org/dmn/_857FE424-BEDA-4772-AB8E-2F4CDDB864AB : Loan_Qualification }"
    },
    Loan_Qualification_Qualification: {
      enum: ["Qualified", "Not Qualified"],
      type: "string",
      "x-dmn-type": "FEEL:string"
    },
    Applicant_Data: {
      type: "object",
      properties: {
        Age: { type: "number", "x-dmn-type": "FEEL:number" },
        "Marital Status": { $ref: "#/definitions/Marital_Status" },
        "Employment Status": { $ref: "#/definitions/Employment_Status" },
        "Existing Customer": { type: "boolean", "x-dmn-type": "FEEL:boolean" },
        Monthly: { $ref: "#/definitions/Applicant_Data_Monthly" }
      },
      "x-dmn-type": "DMNType{ https://kiegroup.org/dmn/_857FE424-BEDA-4772-AB8E-2F4CDDB864AB : Applicant_Data }"
    },
    Front_End_Ratio: {
      enum: ["Sufficient", "Insufficient"],
      type: "string",
      "x-dmn-type": "DMNType{ https://kiegroup.org/dmn/_857FE424-BEDA-4772-AB8E-2F4CDDB864AB : Front_End_Ratio }"
    },
    Requested_Product: {
      type: "object",
      properties: {
        Type: { $ref: "#/definitions/Product_Type" },
        Rate: { type: "number", "x-dmn-type": "FEEL:number" },
        Term: { type: "number", "x-dmn-type": "FEEL:number" },
        Amount: { type: "number", "x-dmn-type": "FEEL:number" }
      },
      "x-dmn-type": "DMNType{ https://kiegroup.org/dmn/_857FE424-BEDA-4772-AB8E-2F4CDDB864AB : Requested_Product }"
    },
    Back_End_Ratio: {
      enum: ["Insufficient", "Sufficient"],
      type: "string",
      "x-dmn-type": "DMNType{ https://kiegroup.org/dmn/_857FE424-BEDA-4772-AB8E-2F4CDDB864AB : Back_End_Ratio }"
    },
    Credit_Score: {
      type: "object",
      properties: { FICO: { $ref: "#/definitions/Credit_Score_FICO" } },
      "x-dmn-type": "DMNType{ https://kiegroup.org/dmn/_857FE424-BEDA-4772-AB8E-2F4CDDB864AB : Credit_Score }"
    },
    Applicant_Data_Monthly: {
      type: "object",
      properties: {
        Income: { type: "number", "x-dmn-type": "FEEL:number" },
        Repayments: { type: "number", "x-dmn-type": "FEEL:number" },
        Expenses: { type: "number", "x-dmn-type": "FEEL:number" },
        Tax: { type: "number", "x-dmn-type": "FEEL:number" },
        Insurance: { type: "number", "x-dmn-type": "FEEL:number" }
      }
    },
    Credit_Score_Rating: {
      enum: ["Poor", "Bad", "Fair", "Good", "Excellent"],
      type: "string",
      "x-dmn-type": "DMNType{ https://kiegroup.org/dmn/_857FE424-BEDA-4772-AB8E-2F4CDDB864AB : Credit_Score_Rating }"
    },
    Employment_Status: {
      enum: ["Unemployed", "Employed", "Self-employed", "Student"],
      type: "string",
      "x-dmn-type": "FEEL:string"
    },
    Product_Type: {
      enum: ["Standard Loan", "Special Loan"],
      type: "string",
      "x-dmn-type": "DMNType{ https://kiegroup.org/dmn/_857FE424-BEDA-4772-AB8E-2F4CDDB864AB : Product_Type }"
    },
    Credit_Score_FICO: { type: "number", "x-dmn-type": "FEEL:number\n[[300..850]]" },
    Marital_Status: {
      enum: ["M", "D", "S"],
      type: "string",
      "x-dmn-type": "DMNType{ https://kiegroup.org/dmn/_857FE424-BEDA-4772-AB8E-2F4CDDB864AB : Marital_Status }"
    },
    InputSet: {
      type: "object",
      properties: {
        "Credit Score": { $ref: "#/definitions/Credit_Score" },
        "Applicant Data": { $ref: "#/definitions/Applicant_Data" },
        "Requested Product": { $ref: "#/definitions/Requested_Product" }
      },
      "x-dmn-type": "DMNType{ https://kiegroup.org/dmn/_857FE424-BEDA-4772-AB8E-2F4CDDB864AB : InputSet }"
    }
  },
  properties: { context: { $ref: "#/definitions/InputSet" } },
  type: "object"
};

function createValidator(jsonSchema: Schema) {
  const validator = ajv.compile(jsonSchema);

  return (model: any) => {
    validator(model);

    return validator.errors?.length
      ? {
          details: validator.errors?.map(error => {
            if (error.keyword === "required") {
              return { ...error, message: "Required" };
            }
            return error;
          })
        }
      : null;
  };
}

export class DmnRunner {
  public static async checkServer(): Promise<boolean> {
    const response = await fetch(JIT_DMN_SERVER, { method: "OPTIONS" });
    return response.status < 300;
  }

  public static async download() {
    try {
      const response = await fetch(JIT_DOWNLOAD, { method: "GET" });
      const blob = await response.blob();

      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, "_blank");
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("Automatic JIT download failed.");
    }
  }

  public static validateForm(payload: JitDmnPayload) {
    return fetch(JIT_DMN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*"
      },
      body: JSON.stringify(payload)
    });
  }

  public static async getFormSchema(model: string) {
    try {
      const response = await fetch(JIT_DMN_SCHEMA_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/xml;"
        },
        body: model
      });
      const jitDmnSchema = await response.json();
      const jitDmnSchemaHard = schema;
      return new JSONSchemaBridge(jitDmnSchemaHard, createValidator(jitDmnSchemaHard));
    } catch (err) {
      console.error(err);
    }
  }
}
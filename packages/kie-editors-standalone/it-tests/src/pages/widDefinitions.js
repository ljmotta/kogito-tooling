export const customWorkItemWid = `
[
  [
    "name" : "CreateCustomer",
    "version" : "1.0.0",
    "documentation" : "Calls internal service that creates the customer in database server.",
    "displayName" : "Create Customer Internal Service",
    "parameters" : [
	    "in_customer_id" : new StringDataType(),
      "in_customer_level_id" : new IntegerDataType(),
      "in_customer_initial_balance" : new FloatDataType(),
      "in_customer_level_label" : new EnumDataType(),
      "in_customer_roles" : new ListDataType(),
      "in_security_token" : new ObjectDataType(),
      "in_message" : new UndefinedDataType(),
    ],
    "parameterValues" : [
      "in_customer_id" : "MrIncognito",
    ],
    "results" : [
      "out_operation_success" : new BooleanDataType()
    ],
    "icon" : "defaultemailicon.gif",
  ]
]`;

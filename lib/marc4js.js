import Record from "./marc/record.js";
import DataField from "./marc/data_field.js";
import ControlField from "./marc/control_field.js";
import Leader from "./marc/leader.js";
import Subfield from "./marc/subfield.js";
import MarcError from "./marc_error.js";
import VariableField from "./marc/variable_field.js";
import parse from "./parse.js";
import transform from "./transform.js";

export default {
    marc: {
        Record,
        DataField,
        ControlField,
        Leader,
        Subfield,
        MarcError,
        VariableField,
        parse,
        transform,
    },
};

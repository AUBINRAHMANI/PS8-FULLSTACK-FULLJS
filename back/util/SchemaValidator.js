

class SchemaValidator {
    compile(schemaToValidate) {
        const schema = schemaToValidate;
        return (data) => this.#validateType(data, schema);
    }

    #validateType(value, schema) {
        if (typeof schema === 'undefined') return true;
        if (schema.type === 'array') {
            if (Array.isArray(value)) {
                if (typeof schema.items === 'undefined') return true;
                return value
                    .reduce(
                        (acc, val) => (acc && this.#validateType(val, schema.items.type)),
                        true,
                    );
            }
            return false;
        }

        if (schema.type === 'object') {
            const objectProperties = Object.keys(value);
            const expectedProperties = Object.keys(schema.properties);
            if (typeof schema.required !== 'undefined') {
                if (!schema.required.every((el) => objectProperties.includes(el))) return false;
            }
            if (schema.additionalProperties === false) {
                if (!objectProperties.every((el) => expectedProperties.includes(el))) return false;
            }
            if (typeof schema.properties === 'undefined') return true;
            return objectProperties
                .reduce(
                    (acc, prop) => (acc && this.#validateType(value[prop], schema.properties[prop])),
                    true,
                );
        }
        if (schema.type === 'string' && typeof value === 'string') return true;
        if (schema.type === 'number' && typeof value === 'number') return true;
        if (schema.type === 'boolean' && typeof value === 'boolean') return true;
        return false;
    }
}

export default SchemaValidator;

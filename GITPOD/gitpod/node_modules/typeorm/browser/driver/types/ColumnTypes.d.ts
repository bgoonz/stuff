/**
 * Column types where precision and scale properties are used.
 */
export declare type PrimaryGeneratedColumnType = "int" | "int2" | "int2" | "int4" | "int8" | "integer" | "tinyint" | "smallint" | "mediumint" | "bigint" | "dec" | "decimal" | "numeric" | "number";
/**
 * Column types where precision and scale properties are used.
 */
export declare type WithPrecisionColumnType = "float" | "double" | "dec" | "decimal" | "numeric" | "real" | "double precision" | "number" | "datetime" | "datetime2" | "datetimeoffset" | "time" | "time with time zone" | "time without time zone" | "timestamp" | "timestamp without time zone" | "timestamp with time zone";
/**
 * Column types where column length is used.
 */
export declare type WithLengthColumnType = "int" | "tinyint" | "smallint" | "mediumint" | "bigint" | "character varying" | "varying character" | "nvarchar" | "character" | "native character" | "varchar" | "char" | "nchar" | "varchar2" | "nvarchar2" | "binary" | "varbinary";
/**
 * All other regular column types.
 */
export declare type SimpleColumnType = "simple-array" | "simple-json" | "bit" | "int2" | "integer" | "int4" | "int8" | "unsigned big int" | "float4" | "float8" | "smallmoney" | "money" | "boolean" | "bool" | "tinyblob" | "tinytext" | "mediumblob" | "mediumtext" | "blob" | "text" | "ntext" | "citext" | "longblob" | "longtext" | "bytea" | "long" | "raw" | "long raw" | "bfile" | "clob" | "nclob" | "image" | "timestamp with local time zone" | "smalldatetime" | "date" | "interval year" | "interval day" | "interval" | "year" | "point" | "line" | "lseg" | "box" | "circle" | "path" | "polygon" | "enum" | "cidr" | "inet" | "macaddr" | "bit" | "bit varying" | "varbit" | "tsvector" | "tsquery" | "uuid" | "xml" | "json" | "jsonb" | "varbinary" | "cursor" | "hierarchyid" | "sql_variant" | "table" | "rowid" | "urowid" | "uniqueidentifier";
/**
 * Any column type column can be.
 */
export declare type ColumnType = WithPrecisionColumnType | WithLengthColumnType | SimpleColumnType | BooleanConstructor | DateConstructor | NumberConstructor | StringConstructor;

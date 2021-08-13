%module xmlsec
%{ 
#include <libxml/tree.h>
%}

%typemap(in) xmlDocPtr {
xmlDocPtr doc;
Data_Get_Struct($input, xmlDocPtr, doc);
$1 = doc;
}

int verify_file(const char* xmlMessage, const char* key); 
int verify_document(xmlDocPtr doc, const char* key);

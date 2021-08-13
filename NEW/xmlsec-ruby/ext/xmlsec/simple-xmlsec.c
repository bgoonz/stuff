#include <stdlib.h>
#include <string.h>
#include <assert.h>
#include <ruby.h>
 
#include <libxml/tree.h>
#include <libxml/xmlmemory.h>
#include <libxml/parser.h>
#include <libxml/xpath.h>
#include <libxml/xpathInternals.h>
 
#include <xmlsec/xmlsec.h>
#include <xmlsec/xmltree.h>
#include <xmlsec/xmldsig.h>
#include <xmlsec/xmlenc.h>
#include <xmlsec/crypto.h>
#include <xmlsec/bn.h>

 
int initialize() ;
void SecShutdown() ;
void cleanup(xmlSecDSigCtxPtr dsigCtx) ;
int verify_document(xmlDocPtr doc, const char* key); 
int verify_file(const char* xmlMessage, const char* key); 
void xmlSecErrorCallback(const char* file, int line, const char* func, const char* errorObject, const char* errorSubject, int reason, const char* msg); 
int assign_id_attributes(xmlDocPtr doc) {
  // Assume the ID attribute is one of (ID | Id | id) and tell this to libxml
  xmlXPathContextPtr xpathCtx = xmlXPathNewContext(doc);
  if(xpathCtx == NULL) {
	  xmlFreeDoc(doc); 
	  rb_raise(rb_eRuntimeError,"Error: unable to create new XPath context\n");
	  return(-1);
  }
  xmlChar* xpathExpr = "//*[@ID | @Id | @id]";
      
  xmlXPathObjectPtr xpathObj = xmlXPathEvalExpression(xpathExpr, xpathCtx);
  if(xpathObj == NULL) {
	  xmlXPathFreeContext(xpathCtx); 
	  xmlFreeDoc(doc); 
	  rb_raise(rb_eRuntimeError,"Error: unable to evaluate xpath expression \"%s\"\n", xpathExpr);
	  return(-1);
  }
  xmlNodeSetPtr nodes = xpathObj->nodesetval;
  int size = (nodes) ? nodes->nodeNr : 0;
  char* idNames[] = {"ID", "Id", "id"};
  xmlAttrPtr attr, tmp;
  int i,j;
  for(i = 0; i < size; i++) {
	  for(j=0; j<3;j++) {
	  	tmp = xmlHasProp(nodes->nodeTab[i], idNames[j]);
		if(tmp != NULL)
			attr = tmp;
	  }
	  if(attr == NULL) {
		xmlXPathFreeContext(xpathCtx); 
		return(-1);
  	 }
	 xmlChar* name = xmlNodeListGetString(doc, attr->children, 1);
	 if(name == NULL) {
		xmlXPathFreeContext(xpathCtx); 
		return(-1);
	 }
	 xmlAttrPtr tmp = xmlGetID(doc, name);
	 if(tmp != NULL) {
		 xmlFree(name);
		 return 0;
	 }
	 xmlAddID(NULL, doc, name, attr);
	 xmlFree(name);
  }

  xmlXPathFreeObject(xpathObj);
  xmlXPathFreeContext(xpathCtx);
}

 
/* functions */
int verify_file(const char* xmlMessage, const char* key) {
  xmlDocPtr doc = NULL;
  /* Init libxml and libxslt libraries */
  LIBXML_TEST_VERSION
  xmlSubstituteEntitiesDefault(1);
  doc = xmlParseDoc((xmlChar *) xmlMessage) ;
  return verify_document(doc, key);
}

int verify_document(xmlDocPtr doc, const char* key) {
  initialize();
  xmlNodePtr node = NULL;
  xmlSecDSigCtxPtr dsigCtx = NULL;
  int res = 0;
 
  if ((doc == NULL) || (xmlDocGetRootElement(doc) == NULL)){
	rb_raise(rb_eRuntimeError, "unable to parse XML document");
  }
    
  /* find start node */
  node = xmlSecFindNode(xmlDocGetRootElement(doc), xmlSecNodeSignature, xmlSecDSigNs);
  if(node == NULL) {
	rb_raise(rb_eRuntimeError, "could not find start node in XML document");
  }

  if(assign_id_attributes(doc) < 0) {
	  rb_raise(rb_eRuntimeError, "Could not find ID attribute in document");
  }
  

  /* create signature context */
  dsigCtx = xmlSecDSigCtxCreate(NULL);
  if(dsigCtx == NULL) {
	cleanup(dsigCtx);
	rb_raise(rb_eRuntimeError, "could not create signature context");
  }
 
	/* load public key */
	dsigCtx->signKey = xmlSecCryptoAppKeyLoadMemory(key, strlen(key), xmlSecKeyDataFormatCertPem, NULL, NULL, NULL);
	if(dsigCtx->signKey == NULL) {
		cleanup(dsigCtx);
		rb_raise(rb_eRuntimeError, "could not read public pem key %s", key);
	}
	 
  /* Verify signature */
  if(xmlSecDSigCtxVerify(dsigCtx, node) < 0) {
	cleanup(dsigCtx);
	rb_raise(rb_eRuntimeError, "Document does not seem to be in an XMLDsig format");
  }
        
  /* print verification result to stdout */
  if(dsigCtx->status == xmlSecDSigStatusSucceeded) {
	  res = 1;
  } else {
	  res = 0;
  }    
  cleanup(dsigCtx);
  return res;
}

void cleanup(xmlSecDSigCtxPtr dsigCtx) {
  if(dsigCtx != NULL) {
    xmlSecDSigCtxDestroy(dsigCtx);
  }
  SecShutdown() ;
}
 
int initialize()
{
            
  /* Init xmlsec library */
  if(xmlSecInit() < 0) {
    fprintf(stdout, "Error: xmlsec initialization failed.\n");
    fflush(stdout) ;
    return(-1);
  }
 
  /* Check loaded library version */
  if(xmlSecCheckVersion() != 1) {
    fprintf(stderr, "Error: loaded xmlsec library version is not compatible.\n");
    return(-1);
  }
 
  /* Init xmlsec-crypto library */
  if(xmlSecCryptoInit() < 0) {
    fprintf(stderr, "Error: xmlsec-crypto initialization failed.\n");
    return(-1);
  }
  xmlSecErrorsSetCallback(xmlSecErrorCallback);
}

void xmlSecErrorCallback(const char* file, int line, const char* func, const char* errorObject, const char* errorSubject, int reason, const char* msg) {
	rb_raise(rb_eRuntimeError, "XMLSec error in %s: %s", func, msg);
}
 
void SecShutdown()
{
  /* Shutdown xmlsec-crypto library */
  xmlSecCryptoShutdown();
  
  /* Shutdown xmlsec library */
  xmlSecShutdown();
  return ;
}

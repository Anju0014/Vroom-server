

export enum StatusCode {
    
    CONTINUE = 100,                    
    SWITCHING_PROTOCOLS = 101,         
    PROCESSING = 102,                  
    EARLY_HINTS = 103,                 
    
    OK = 200,                          
    CREATED = 201,                     
    ACCEPTED = 202,                    
    NON_AUTHORITATIVE_INFORMATION = 203, 
    NO_CONTENT = 204,                  
    PARTIAL_CONTENT = 206,             
  
    
    MOVED_PERMANENTLY = 301,           
    FOUND = 302,                       
    SEE_OTHER = 303,                  
    NOT_MODIFIED = 304,                
    TEMPORARY_REDIRECT = 307,          
    PERMANENT_REDIRECT = 308,          
  
    
    BAD_REQUEST = 400,                 
    UNAUTHORIZED = 401,                
    FORBIDDEN = 403,                   
    NOT_FOUND = 404,                   
    METHOD_NOT_ALLOWED = 405,          
    CONFLICT = 409,                    

    
    INTERNAL_SERVER_ERROR = 500,       
    NOT_IMPLEMENTED = 501,             
    BAD_GATEWAY = 502,                 
    SERVICE_UNAVAILABLE = 503,         
    GATEWAY_TIMEOUT = 504,
    HTTP_VERSION_NOT_SUPPORTED = 505   
}



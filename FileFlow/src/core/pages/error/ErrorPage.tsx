import { useRouteError } from "react-router";

function ErrorPage() {
    const error = useRouteError() as {statusText?: string, message?: string};
    
    return(
        <div id="errorPage" >
            <h1>the page was not found</h1>
            <i>{error.statusText || error.message}</i>
        </div>
    );
}   

export default ErrorPage;
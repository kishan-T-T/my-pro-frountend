import { CreateProfile } from 'pages/CreateProfile';
import { Landing } from 'pages/Landing';
import { Login } from 'pages/Login';
import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

interface Props {
    setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

export const UnauthenticatedRoutes: React.FC<Props> = ({ setAuthenticated }) => {
    return (
        <Switch>
            <Route path="/" exact component={Landing} />
            <Route path="/login" exact component={Login} />
            <Route
                path="/create-profile"
                exact
                component={(props: any) => <CreateProfile setAuthenticated={setAuthenticated} {...props} />}
            />
            <Redirect path="*" to="/" />
        </Switch>
    );
};

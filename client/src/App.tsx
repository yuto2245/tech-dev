import { Route, Switch } from "wouter";
import Home from "./pages/Home";
import BlogList from "./pages/BlogList";
import BlogDetail from "./pages/BlogDetail";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AISearch from "./pages/AISearch";

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/blog" component={BlogList} />
      <Route path="/blog/:slug" component={BlogDetail} />
      <Route path="/settings" component={Settings} />
      <Route path="/ai-search" component={AISearch} />
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

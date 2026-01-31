import { Layout } from './components/Layout';
import { Header } from './components/Header';
import { TaskDashboard } from './components/TaskDashboard';
import { Footer } from './components/Footer';

function App() {
  return (
    <Layout>
      <Header />
      <TaskDashboard />
      <Footer />
    </Layout>
  );
}

export default App;

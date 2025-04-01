// pages/lifecycle/[id]/activity.js
import LifecycleLayout from '../../../components/LifecycleLayout';
import { useRouter } from 'next/router';

export default function LifecycleActivity() {
  const router = useRouter();
  const { id } = router.query;
  
  if (!id) {
    return <div>Loading...</div>;
  }

  return (
    <LifecycleLayout id={id} title="Activity" activeTab="activity">
      <h2>Assignments</h2>
      <p>The following assignments will help you develop your understanding of the course themes and practice critical thinking and writing skills.</p>
      
      <div style={{ marginTop: '30px', backgroundColor: '#fff', padding: '20px', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '25px' }}>
        <h3>Task</h3>
        <p>Upload a picture</p>
        <p><strong>Due:</strong> Upload before Thursday's Class</p>
        <p><strong>Submission Format:</strong> Image document uploaded to the course portal</p>
      </div>
      
      <div style={{ marginTop: '30px', backgroundColor: '#fff', padding: '20px', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '25px' }}>
        <h3>Reading Response</h3>
        <p>After completing the assigned readings, respond to the following prompts:</p>
        <ol>
          <li>Which reading resonated with you the most and why?</li>
          <li>Identify one concept from the readings that challenges your existing understanding of "living."</li>
          <li>How might you apply these ideas to your own life experience?</li>
        </ol>
        <p><strong>Due:</strong> Tuesday before class</p>
        <p><strong>Length:</strong> 500-750 words</p>
      </div>
      
      <div style={{ marginTop: '30px', backgroundColor: '#fff', padding: '20px', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '25px' }}>
        <h3>In-Class Activities</h3>
        <p>Be prepared to participate in the following in-class activities:</p>
        <ul>
          <li>Small group discussions on assigned readings</li>
          <li>Philosophical dialogue exercise</li>
          <li>Creative visualization activity</li>
        </ul>
        <p><strong>Preparation:</strong> Come to class having completed all readings and with notes on key points</p>
      </div>
    </LifecycleLayout>
  );
}

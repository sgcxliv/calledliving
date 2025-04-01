import Layout from '../components/Layout';

export default function Calendar() {
  return (
    <Layout title="Course Dashboard - Calendar">
      <div className="tab-content active">
        <h2>Course Calendar</h2>
        <p>Below is the schedule for the entire course. Please note that this schedule is subject to change.</p>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#ddd' }}>
              <th style={{ border: '1px solid #999', padding: '4px' }}>Week</th>
              <th style={{ border: '1px solid #999', padding: '6px' }}>Date</th>
              <th style={{ border: '1px solid #999', padding: '8px' }}>Topic</th>
              <th style={{ border: '1px solid #999', padding: '8px' }}>Assignments</th>
              <th style={{ border: '1px solid #999', padding: '6px' }}>Time & Place</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #999', padding: '8px' }}>1</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>April 1st</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Introductions</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Meal & Item Exchange</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>1:30 - 2:50, Room </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #999', padding: '8px' }}>2</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>April 3rd</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Student Life</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Bing Nursery Sign-Ups</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>1:30 - 2:50, Room </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #999', padding: '8px' }}>3</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>April 8th</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Family Matters</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Upload a Family Photo</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>1:30 - 2:50, Room </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #999', padding: '8px' }}>4</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>April 10th</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Recess</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Play!</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>1:30 - 2:50, Room </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #999', padding: '8px' }}>5</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>April 15th</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Making a Living</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Interview Clips</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>1:30 - 2:50, Room </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #999', padding: '8px' }}>6</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>April 17th</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Work-Life Balance</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>?</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>1:30 - 2:50, Room </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #999', padding: '8px' }}>7</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>April 22nd</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Nightlife</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Signs of Nightlife</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>1:30 - 2:50, Room </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #999', padding: '8px' }}>8</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>April 24th</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Staying Awake</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>?</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>9:30 - 10:50, Room </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

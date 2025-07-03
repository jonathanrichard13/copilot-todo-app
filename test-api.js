// Simple test script to verify API endpoints
const baseUrl = 'http://localhost:3000';

async function testAPI() {
  console.log('Testing Todo List API...\n');

  try {
    // Test health check
    console.log('1. Health Check:');
    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthData = await healthResponse.json();
    console.log('✅', healthData.message);
    console.log('');

    // Test get all lists
    console.log('2. Get All Lists:');
    const listsResponse = await fetch(`${baseUrl}/api/lists`);
    const listsData = await listsResponse.json();
    console.log('✅ Found', listsData.data.length, 'lists');
    console.log('Lists:', listsData.data.map(list => list.name).join(', '));
    console.log('');

    // Test create new list
    console.log('3. Create New List:');
    const createResponse = await fetch(`${baseUrl}/api/lists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Shopping List',
        description: 'Items to buy from the store'
      })
    });
    const createData = await createResponse.json();
    console.log('✅ Created list:', createData.data.name);
    const newListId = createData.data.id;
    console.log('');

    // Test create task in list
    console.log('4. Create Task in List:');
    const taskResponse = await fetch(`${baseUrl}/api/lists/${newListId}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Buy milk',
        description: 'Get organic milk from the grocery store',
        priority: 'high'
      })
    });
    const taskData = await taskResponse.json();
    console.log('✅ Created task:', taskData.data.title);
    console.log('');

    // Test get tasks due this week
    console.log('5. Get Tasks Due This Week:');
    const dueResponse = await fetch(`${baseUrl}/api/tasks/due-this-week`);
    const dueData = await dueResponse.json();
    console.log('✅ Found', dueData.data.length, 'tasks due this week');
    console.log('');

    console.log('🎉 All API tests passed!');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPI();

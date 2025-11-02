import { useState } from 'react';
import { supabase } from '../utils/supabase/client';
import { askCopilot } from '../../lib/openai';

export default function Copilot({ userId }: { userId: string }) {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const result = await askCopilot(input);
      setResponse(result.output || 'No response received.');

      // Log to Supabase
      await supabase.from('copilot_logs').insert({
        user_id: userId,
        input_text: input,
        response_text: result.output,
      });
    } catch (err) {
      setResponse('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded p-4 w-full max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-2">TasKeen Copilot 🤖</h2>
      <textarea
        className="w-full border rounded p-2 mb-2"
        rows={4}
        placeholder="Ask about a lease, payment, or tenant..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleAsk}
        disabled={loading}
      >
        {loading ? 'Thinking...' : 'Ask Copilot'}
      </button>
      {response && (
        <div className="mt-4 bg-gray-100 p-3 rounded text-sm">
          <strong>Response:</strong> {response}
        </div>
      )}
    </div>
  );
}
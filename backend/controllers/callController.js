import supabase from '../config/db.js';

export const createCall = async (req, res) => {
  try {
    const { receiver_id, call_type } = req.body;
    const caller_id = req.user.id; // from auth middleware

    if (!receiver_id) {
      return res.status(400).json({ success: false, error: 'receiver_id is required' });
    }

    const { data, error } = await supabase
      .from('calls')
      .insert({
        caller_id,
        receiver_id,
        call_type: call_type || 'audio',
        status: 'Calling',
        started_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, call: data });
  } catch (error) {
    console.error('[CallController.createCall] error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCallById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('calls')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, error: 'Call not found' });

    res.status(200).json({ success: true, call: data });
  } catch (error) {
    console.error('[CallController.getCallById] error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const acceptCall = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('calls')
      .update({
        status: 'Connected',
        connected_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, call: data });
  } catch (error) {
    console.error('[CallController.acceptCall] error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const rejectCall = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('calls')
      .update({
        status: 'Rejected',
        ended_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, call: data });
  } catch (error) {
    console.error('[CallController.rejectCall] error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const endCall = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('calls')
      .update({
        status: 'Ended',
        ended_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, call: data });
  } catch (error) {
    console.error('[CallController.endCall] error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getUserCalls = async (req, res) => {
  try {
    const { userId } = req.params;
    // Basic authorization check could be added here
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized to view these calls' });
    }

    const { data, error } = await supabase
      .from('calls')
      .select('*')
      .or(`caller_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json({ success: true, calls: data || [] });
  } catch (error) {
    console.error('[CallController.getUserCalls] error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

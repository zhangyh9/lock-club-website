#!/usr/bin/env python3
"""Fix memory leaks from addEventListener without removeEventListener"""

filepath = '/Users/hugo/.openclaw/workspace/lock-club-website/site/complete-app2.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

original_len = len(content)
print(f"Original: {original_len} chars")

# Fix 1: Deposit method toggle handler - store reference properly for cleanup
# Before: radio.addEventListener('change', handler);
# After: store in global and add cleanup
old1 = """      _depositMethodHandler = handler;
      document.querySelectorAll('input[name="deposit-method"]').forEach(function(radio) {
        radio.addEventListener('change', handler);
      });"""
new1 = """      _depositMethodHandler = handler;
      document.querySelectorAll('input[name="deposit-method"]').forEach(function(radio) {
        radio.addEventListener('change', handler);
      });
      // Cleanup: remove previous handlers before adding new ones
      window._cleanupDepositHandlers = function() {
        document.querySelectorAll('input[name="deposit-method"]').forEach(function(radio) {
          radio.removeEventListener('change', _depositMethodHandler);
        });
      };"""
content = content.replace(old1, new1)

# Fix 2: Leave request date handlers - add removeEventListener
old2 = """  // Auto-calculate duration when dates change
  document.getElementById('lr-start').addEventListener('change',calcLeaveDuration);
  document.getElementById('lr-end').addEventListener('change',calcLeaveDuration);
}
function calcLeaveDuration(){"""
new2 = """  // Auto-calculate duration when dates change
  // Cleanup previous handlers if exist
  if (window._lrStartHandler) { document.getElementById('lr-start').removeEventListener('change', window._lrStartHandler); }
  if (window._lrEndHandler) { document.getElementById('lr-end').removeEventListener('change', window._lrEndHandler); }
  window._lrStartHandler = calcLeaveDuration;
  window._lrEndHandler = calcLeaveDuration;
  document.getElementById('lr-start').addEventListener('change', calcLeaveDuration);
  document.getElementById('lr-end').addEventListener('change', calcLeaveDuration);
}
function calcLeaveDuration(){"""
content = content.replace(old2, new2)

# Fix 3: Notification filter handlers - properly store and cleanup
old3 = """    if (notifTypeFilter) { _notifTypeHandler = applyNotifFilter; notifTypeFilter.addEventListener('change', applyNotifFilter); }
    if (notifStatusFilter) { _notifStatusHandler = applyNotifFilter; notifStatusFilter.addEventListener('change', applyNotifFilter); }"""
new3 = """    if (notifTypeFilter) {
      if (_notifTypeHandler) notifTypeFilter.removeEventListener('change', _notifTypeHandler);
      _notifTypeHandler = applyNotifFilter;
      notifTypeFilter.addEventListener('change', applyNotifFilter);
    }
    if (notifStatusFilter) {
      if (_notifStatusHandler) notifStatusFilter.removeEventListener('change', _notifStatusHandler);
      _notifStatusHandler = applyNotifFilter;
      notifStatusFilter.addEventListener('change', applyNotifFilter);
    }"""
content = content.replace(old3, new3)

# Fix 4: Record filter handlers - properly store and cleanup
old4 = """    if (recSearch) recSearch.addEventListener('input', applyRecordFilter);
    if (recTypeFilter) recTypeFilter.addEventListener('change', applyRecordFilter);
    if (recStatusFilter) recStatusFilter.addEventListener('change', applyRecordFilter);"""
new4 = """    if (recSearch) {
      if (_recSearchHandler) recSearch.removeEventListener('input', _recSearchHandler);
      _recSearchHandler = applyRecordFilter;
      recSearch.addEventListener('input', applyRecordFilter);
    }
    if (recTypeFilter) {
      if (_recTypeHandler) recTypeFilter.removeEventListener('change', _recTypeHandler);
      _recTypeHandler = applyRecordFilter;
      recTypeFilter.addEventListener('change', applyRecordFilter);
    }
    if (recStatusFilter) {
      if (_recStatusHandler) recStatusFilter.removeEventListener('change', _recStatusHandler);
      _recStatusHandler = applyRecordFilter;
      recStatusFilter.addEventListener('change', applyRecordFilter);
    }"""
content = content.replace(old4, new4)

# Fix 5: Invoice search handlers - properly store and cleanup
old5 = """    if (invSearch) invSearch.addEventListener('input', applyInvoiceSearch);
    if (oplogDateStart) oplogDateStart.addEventListener('change', applyOplogFilter);
    if (oplogDateEnd) oplogDateEnd.addEventListener('change', applyOplogFilter);
    if (oplogTarget) oplogTarget.addEventListener('input', applyOplogFilter);"""
new5 = """    if (invSearch) {
      if (_invSearchHandler) invSearch.removeEventListener('input', _invSearchHandler);
      _invSearchHandler = applyInvoiceSearch;
      invSearch.addEventListener('input', applyInvoiceSearch);
    }
    if (oplogDateStart) {
      if (_oplogStartHandler) oplogDateStart.removeEventListener('change', _oplogStartHandler);
      _oplogStartHandler = applyOplogFilter;
      oplogDateStart.addEventListener('change', applyOplogFilter);
    }
    if (oplogDateEnd) {
      if (_oplogEndHandler) oplogDateEnd.removeEventListener('change', _oplogEndHandler);
      _oplogEndHandler = applyOplogFilter;
      oplogDateEnd.addEventListener('change', applyOplogFilter);
    }
    if (oplogTarget) {
      if (_oplogTargetHandler) oplogTarget.removeEventListener('input', _oplogTargetHandler);
      _oplogTargetHandler = applyOplogFilter;
      oplogTarget.addEventListener('input', applyOplogFilter);
    }"""
content = content.replace(old5, new5)

print(f"After memory leak fixes: {len(content)} chars (removed {original_len - len(content)} chars)")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Saved!")

---

<% Object.entries(changes).forEach(([pkg, change]) => { %>"<%= pkg %>": <%= change %>
<% }) %>---

<%= message %>

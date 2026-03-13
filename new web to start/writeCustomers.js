const fs=require('fs');const c=\import React,{useState,useMemo}from'react';import{useApp}from'../context/AppContext';import{useAuth}from'../context/AuthContext';import CustomerTable from'../components/CustomerTable';import{generatePDFReport}from'../utils/pdfGenerator';import{formatCurrency}from'../utils/helpers';import{Plus,Search,Filter,X,UserPlus,Pencil}from'lucide-react';const Customers=()=>{const{customers,searchQuery,setSearchQuery,adminRules,addCustomer,updateCustomer,deleteCustomer,addWhatsappMessage}=useApp();const{canAdd,canDelete}=useAuth();const[showAddModal,setShowAddModal]=useState(false);const[showEditModal,setShowEditModal]=useState(false);const[selectedCustomer,setSelectedCustomer]=useState(null);const[filterStatus,setFilterStatus]=useState('all');const handleEdit=(customer)=>{setSelectedCustomer(customer);setShowEditModal(true);};const filteredCustomers=useMemo(()=>{let result=customers;if(searchQuery){const q=searchQuery.toLowerCase();result=result.filter(c=>c.name.toLowerCase().includes(q)||c.mobile.includes(searchQuery)||c.uan.includes(searchQuery)||c.id.toLowerCase().includes(q));}if(filterStatus!=='all'){result=result.filter(c=>{if(filterStatus==='settled')return c.form19Status==='Settled';if(filterStatus==='pending')return c.form19Status==='Pending';if(filterStatus==='working')return!c.doe;return true;});}return result;},[customers,searchQuery,filterStatus]);const handleGenerateReport=async(customer)=>{await generatePDFReport(customer,adminRules);};const handleWhatsApp=(customer)=>{const message=adminRules.messageTemplates.english.welcome.replace('{balance}',formatCurrency(customer.passbookBalance));addWhatsappMessage({customerId:customer.id,customerName:customer.name,mobile:customer.mobile,message,type:'welcome'});alert('WhatsApp message prepared for '+customer.name);};const handleDelete=(id)=>{if(confirm('Delete this customer?')){deleteCustomer(id);}};return(<div className=\
space-y-6
animate-fadeIn\><div className=\flex
flex-wrap
items-center
justify-between
gap-4\><div className=\flex
items-center
gap-4\><div className=\relative\><Search className=\absolute
left-3
top-1/2
-translate-y-1/2
text-text-secondary\ size={18}/><input type=\text\ placeholder=\Search...\ value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} className=\input
pl-10
pr-4
py-2
w-80\/></div><div className=\flex
items-center
gap-2\><Filter size={18} className=\text-text-secondary\/><select value={filterStatus} onChange={(e)=>setFilterStatus(e.target.value)} className=\input
py-2\><option value=\all\>All</option><option value=\working\>Working</option><option value=\settled\>Settled</option><option value=\pending\>Pending</option></select></div>{canAdd()&&<button onClick={()=>setShowAddModal(true)} className=\btn
btn-primary\><Plus size={18}/> Add Customer</button>}</div><p className=\text-text-secondary
text-sm\>Showing {filteredCustomers.length} of {customers.length}</p><div className=\card\><CustomerTable customers={filteredCustomers} onView={setSelectedCustomer} onEdit={handleEdit} onDelete={handleDelete} onGenerateReport={handleGenerateReport} onWhatsApp={handleWhatsApp} canDelete={canDelete()}/></div>{showEditModal&&selectedCustomer&&<EditCustomerModal customer={selectedCustomer} onClose={()=>{setShowEditModal(false);setSelectedCustomer(null);}} onEdit={updateCustomer}/>}{showAddModal&&<AddCustomerModal onClose={()=>setShowAddModal(false)} onAdd={addCustomer} existingCustomers={customers}/>}{selectedCustomer&&<CustomerDetailModal customer={selectedCustomer} onClose={()=>setSelectedCustomer(null)} onGenerateReport={handleGenerateReport}/>}</div>);};const AddCustomerModal=({onClose,onAdd,existingCustomers})=>{const[formData,setFormData]=useState({name:'',mobile:'',uan:'',fatherName:'',dob:'',doj:'',doe:'',companyName:'',passbookBalance:0,panLinked:true,bankVerified:true,kycComplete:true,form19Status:'Not Settled',form10CStatus:'Not Settled'});const[memberIds,setMemberIds]=useState([{id:'',company:''}]);const addMemberId=()=>setMemberIds([...memberIds,{id:'',company:''}]);const removeMemberId=(i)=>setMemberIds(memberIds.filter((_,x)=>x!==i));const updateMemberId=(i,f,v)=>{const u=[...memberIds];u[i][f]=v;setMemberIds(u);};const handleSubmit=(e)=>{e.preventDefault();const valid=memberIds.filter(m=>m.id.trim()!=='');const existing=existingCustomers?.find(c=>c.uan===formData.uan||c.mobile===formData.mobile);if(existing){const em=existing.memberIds||[];const nm=[...new Set([...em,...valid.map(m=>m.id)])];const mc={...existing,name:formData.name||existing.name,mobile:formData.mobile||existing.mobile,uan:formData.uan||existing.uan,fatherName:formData.fatherName||existing.fatherName,dob:formData.dob||existing.dob,doj:formData.doj||existing.doj,companyName:formData.companyName||existing.companyName,passbookBalance:formData.passbookBalance||existing.passbookBalance,memberIds:nm,serviceYears:formData.doj?Math.floor((new Date()-new Date(formData.doj))/(1000*60*60*24*365)):existing.serviceYears,age:formData.dob?Math.floor((new Date()-new Date(formData.dob))/(1000*60*60*24*365.25)):existing.age};if(confirm('Customer exists! Merge?')){onAdd(mc);onClose();}return;}const nc={...formData,serviceYears:formData.doj?Math.floor((new Date()-new Date(formData.doj))/(1000*60*60*24*365)):0,memberIds:valid.map(m=>m.id),transfers:[],pensionEligible:false,age:formData.dob?Math.floor((new Date()-new Date(formData.dob))/(1000*60*60*24*365.25)):0,epsDeducted:true,contributions:[]};onAdd(nc);onClose();};return(<div className=\fixed
inset-0
bg-black/50
flex
items-center
justify-center
z-50\><div className=\bg-surface
rounded-2xl
w-full
max-w-2xl
max-h-[90vh]
overflow-y-auto
m-4
p-6\><div className=\flex
justify-between
items-center
mb-4\><h2 className=\text-xl
font-semibold
text-white\><UserPlus size={24} className=\inline\/> Add Customer</h2><button onClick={onClose}><X size={20}/></button></div><form onSubmit={handleSubmit} className=\space-y-4\><div className=\grid
grid-cols-2
gap-4\><div><label className=\block
text-sm
text-text-secondary\>Name*</label><input type=\text\ required value={formData.name} onChange={(e)=>setFormData({...formData,name:e.target.value})} className=\input
w-full\/></div><div><label className=\block
text-sm
text-text-secondary\>Mobile*</label><input type=\text\ required value={formData.mobile} onChange={(e)=>setFormData({...formData,mobile:e.target.value})} className=\input
w-full\ maxLength={10}/></div><div><label className=\block
text-sm
text-text-secondary\>UAN*</label><input type=\text\ required value={formData.uan} onChange={(e)=>setFormData({...formData,uan:e.target.value})} className=\input
w-full\ maxLength={12}/></div><div><label className=\block
text-sm
text-text-secondary\>Father Name</label><input type=\text\ value={formData.fatherName} onChange={(e)=>setFormData({...formData,fatherName:e.target.value})} className=\input
w-full\/></div><div><label className=\block
text-sm
text-text-secondary\>DOB</label><input type=\date\ value={formData.dob} onChange={(e)=>setFormData({...formData,dob:e.target.value})} className=\input
w-full\/></div><div><label className=\block
text-sm
text-text-secondary\>DOJ</label><input type=\date\ value={formData.doj} onChange={(e)=>setFormData({...formData,doj:e.target.value})} className=\input
w-full\/></div><div><label className=\block
text-sm
text-text-secondary\>DOE</label><input type=\date\ value={formData.doe} onChange={(e)=>setFormData({...formData,doe:e.target.value})} className=\input
w-full\/></div><div className=\col-span-2\><label className=\block
text-sm
text-text-secondary\>Company</label><input type=\text\ value={formData.companyName} onChange={(e)=>setFormData({...formData,companyName:e.target.value})} className=\input
w-full\/></div><div><label className=\block
text-sm
text-text-secondary\>Balance</label><input type=\number\ value={formData.passbookBalance} onChange={(e)=>setFormData({...formData,passbookBalance:parseInt(e.target.value)||0})} className=\input
w-full\/></div><div className=\border-t
border-white/10
pt-4\><div className=\flex
justify-between
mb-2\><label className=\text-sm
text-text-secondary\>Member IDs</label><button type=\button\ onClick={addMemberId} className=\text-accent
text-sm\>+ Add</button></div>{memberIds.map((m,i)=>(<div key={i} className=\flex
gap-2
mb-2\><input type=\text\ value={m.id} onChange={(e)=>updateMemberId(i,'id',e.target.value)} className=\input
flex-1\ placeholder=\Member
ID\/><input type=\text\ value={m.company} onChange={(e)=>updateMemberId(i,'company',e.target.value)} className=\input
flex-1\ placeholder=\Company\/>{memberIds.length>1&&<button type=\button\ onClick={()=>removeMemberId(i)} className=\text-error\><X size={18}/></button>}</div>))}</div><div className=\flex
gap-4
pt-4\><button type=\button\ onClick={onClose} className=\btn
btn-secondary
flex-1\>Cancel</button><button type=\submit\ className=\btn
btn-primary
flex-1\>Add</button></div></form></div>);};const CustomerDetailModal=({customer,onClose,onGenerateReport})=>{return(<div className=\fixed
inset-0
bg-black/50
flex
items-center
justify-center
z-50\><div className=\bg-surface
rounded-2xl
w-full
max-w-3xl
max-h-[90vh]
overflow-y-auto
m-4
p-6\><div className=\flex
justify-between
items-center
mb-4\><div><h2 className=\text-xl
font-semibold
text-white\>{customer.name}</h2><p className=\text-text-secondary
text-sm\>{customer.id}</p></div><button onClick={onClose}><X size={20}/></button></div><div className=\space-y-4\><div><h3 className=\font-semibold
text-white
mb-2\>Personal</h3><div className=\grid
grid-cols-3
gap-2\><div><p className=\text-text-secondary
text-xs\>Mobile</p><p className=\text-white\>{customer.mobile}</p></div><div><p className=\text-text-secondary
text-xs\>UAN</p><p className=\text-white\>{customer.uan}</p></div><div><p className=\text-text-secondary
text-xs\>Age</p><p className=\text-white\>{customer.age}</p></div></div><div><h3 className=\font-semibold
text-white
mb-2\>Employment</h3><div className=\grid
grid-cols-3
gap-2\><div><p className=\text-text-secondary
text-xs\>Company</p><p className=\text-white\>{customer.companyName}</p></div><div><p className=\text-text-secondary
text-xs\>Service</p><p className=\text-white\>{customer.serviceYears} yrs</p></div><div><p className=\text-text-secondary
text-xs\>Balance</p><p className=\text-success\>{formatCurrency(customer.passbookBalance)}</p></div></div><div className=\flex
gap-4
mt-4\><button onClick={onClose} className=\btn
btn-secondary
flex-1\>Close</button><button onClick={()=>{onGenerateReport(customer);onClose();}} className=\btn
btn-primary
flex-1\>PDF</button></div></div>);};const EditCustomerModal=({customer,onClose,onEdit})=>{const[formData,setFormData]=useState({name:customer.name,mobile:customer.mobile,uan:customer.uan,memberId:customer.memberId,fatherName:customer.fatherName||'',dob:customer.dob||'',doj:customer.doj||'',doe:customer.doe||'',companyName:customer.companyName||'',passbookBalance:customer.passbookBalance||0,form19Status:customer.form19Status||'Not Settled',form10CStatus:customer.form10CStatus||'Not Settled'});const handleSubmit=(e)=>{e.preventDefault();const uc={...formData,serviceYears:formData.doj?Math.floor((new Date()-new Date(formData.doj))/(1000*60*60*24*365)):0,age:formData.dob?Math.floor((new Date()-new Date(formData.dob))/(1000*60*60*24*365.25)):0};onEdit(customer.id,uc);onClose();};return(<div className=\fixed
inset-0
bg-black/50
flex
items-center
justify-center
z-50\><div className=\bg-surface
rounded-2xl
w-full
max-w-2xl
max-h-[90vh]
overflow-y-auto
m-4
p-6\><div className=\flex
justify-between
items-center
mb-4\><h2 className=\text-xl
font-semibold
text-white\><Pencil size={24} className=\inline\/> Edit</h2><button onClick={onClose}><X size={20}/></button></div><form onSubmit={handleSubmit} className=\space-y-4\><div className=\grid
grid-cols-2
gap-4\><div><label className=\block
text-sm
text-text-secondary\>Name*</label><input type=\text\ required value={formData.name} onChange={(e)=>setFormData({...formData,name:e.target.value})} className=\input
w-full\/></div><div><label className=\block
text-sm
text-text-secondary\>Mobile*</label><input type=\text\ required value={formData.mobile} onChange={(e)=>setFormData({...formData,mobile:e.target.value})} className=\input
w-full\ maxLength={10}/></div><div><label className=\block
text-sm
text-text-secondary\>UAN*</label><input type=\text\ required value={formData.uan} onChange={(e)=>setFormData({...formData,uan:e.target.value})} className=\input
w-full\ maxLength={12}/></div><div><label className=\block
text-sm
text-text-secondary\>Company</label><input type=\text\ value={formData.companyName} onChange={(e)=>setFormData({...formData,companyName:e.target.value})} className=\input
w-full\/></div><div><label className=\block
text-sm
text-text-secondary\>Balance</label><input type=\number\ value={formData.passbookBalance} onChange={(e)=>setFormData({...formData,passbookBalance:parseInt(e.target.value)||0})} className=\input
w-full\/></div><div className=\flex
gap-4
pt-4\><button type=\button\ onClick={onClose} className=\btn
btn-secondary
flex-1\>Cancel</button><button type=\submit\ className=\btn
btn-primary
flex-1\>Save</button></div></form></div>);};export default Customers;\;fs.writeFileSync('src/pages/Customers.jsx',c);

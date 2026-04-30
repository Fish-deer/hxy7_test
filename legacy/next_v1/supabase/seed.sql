-- 运行前请替换用户 UUID
-- <admin-uuid> <teacher-uuid> <student-uuid> <class-uuid>

insert into activities(id,title,description,theme,target_grade,status,teacher_id)
values ('33333333-3333-3333-3333-333333333333','黄石工业文化研学','围绕矿冶文化开展观察研究','工业文化','七年级','published','<teacher-uuid>')
on conflict do nothing;

insert into activity_classes(activity_id,class_id)
values ('33333333-3333-3333-3333-333333333333','<class-uuid>')
on conflict do nothing;

insert into activity_members(activity_id,student_id)
values ('33333333-3333-3333-3333-333333333333','<student-uuid>')
on conflict do nothing;

insert into activity_sites(id,activity_id,name,order_index,intro,key_facts,problem_chain,evidence_checklist)
values
('44444444-4444-4444-4444-444444444441','33333333-3333-3333-3333-333333333333','矿博物馆展厅A',1,'矿石标本区','观察颜色、纹理、用途','[{"level":"核心问题","content":"哪两种矿石差异最大？"}]','["拍摄两种矿石照片","记录差异"]'),
('44444444-4444-4444-4444-444444444442','33333333-3333-3333-3333-333333333333','矿冶设备陈列区',2,'设备发展区','关注结构变化','[{"level":"核心问题","content":"设备结构如何变化？"}]','["拍摄设备细节","写一句解释"]')
on conflict do nothing;

insert into tasks(activity_id,phase,title,description,task_type,sort_order,required)
values
('33333333-3333-3333-3333-333333333333','learn','导学问题准备','围绕主题提出3个问题','text',1,true),
('33333333-3333-3333-3333-333333333333','research','家庭资料卡','整理一条历史资料并注明来源','text',2,true),
('33333333-3333-3333-3333-333333333333','visit','现场证据采集','上传图片+说明','mixed',3,true)
on conflict do nothing;

insert into resource_templates(type,title,content,created_by)
values
('question_chain','通用问题链模板','{"core":"看到了什么","sub":"有哪些证据","follow":"可以如何解释"}','<admin-uuid>'),
('task','三阶段任务模板','{"learn":"提出问题","research":"资料整理","visit":"采集证据"}','<admin-uuid>'),
('site','点位学习卡模板','{"fields":["intro","problem_chain","evidence_checklist"]}','<admin-uuid>')
on conflict do nothing;
